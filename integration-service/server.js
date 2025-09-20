// integration-service/server.js
import express from "express";
import bodyParser from "body-parser";
import { MongoClient, ObjectId } from "mongodb";
import fs from "fs";
import path from "path";

import {
  HttpAgent,
  Actor,
  Identity
} from "@dfinity/agent";
import { Ed25519KeyIdentity } from "@dfinity/identity-ed25519"; // or use local key import method
import fetch from "node-fetch";
globalThis.fetch = fetch;

// Load env or defaults
const {
  MONGO_URI = "mongodb://mongo:27017",
  MONGO_DB = "hefin",
  CANISTER_ID = "",       // set this after dfx deploy
  DFINITY_KEY_PATH = "./dfx_identity.pem",
  PORT = 3000
} = process.env;

if (!CANISTER_ID) {
  console.error("Please set CANISTER_ID env var to your deployed canister id");
  process.exit(1);
}

// Setup DFINITY agent and actor
async function createActor() {
  let identity;
  if (fs.existsSync(DFINITY_KEY_PATH)) {
    const pem = fs.readFileSync(DFINITY_KEY_PATH);
    identity = Ed25519KeyIdentity.fromPEM(pem);
  } else {
    console.warn("No local identity PEM found at", DFINITY_KEY_PATH);
    identity = Ed25519KeyIdentity.generate();
    fs.writeFileSync(DFINITY_KEY_PATH, identity.toPEM());
    console.log("Generated new identity at", DFINITY_KEY_PATH);
  }

  const agent = new HttpAgent({ identity });
  // If running locally, fetch root key for certificate verification:
  try {
    await agent.fetchRootKey();
  } catch (e) {
    console.warn("fetchRootKey failed (likely on mainnet). Continue if mainnet.");
  }

  // Minimal IDL for backend canister calls we use
  const idlFactory = ({ IDL }) => {
    return IDL.Service({
      "addDataPointer": IDL.Func([IDL.Text, IDL.Principal, IDL.Text, IDL.Text], [IDL.Bool], []),
      "getDataPointer": IDL.Func([IDL.Text], [IDL.Opt(IDL.Record({
        id: IDL.Text,
        owner: IDL.Principal,
        createdAt: IDL.Int,
        meta: IDL.Text,
        storageProvider: IDL.Text
      }))], ["query"]),
      "status": IDL.Func([], [IDL.Text], ["query"]),
      "listPointersFor": IDL.Func([IDL.Principal], [IDL.Vec(IDL.Record({
        id: IDL.Text,
        owner: IDL.Principal,
        createdAt: IDL.Int,
        meta: IDL.Text,
        storageProvider: IDL.Text
      }))], ["query"])
    });
  };

  const actor = Actor.createActor(idlFactory, {
    agent,
    canisterId: CANISTER_ID
  });

  return { actor, agent, identity };
}

// Mongo connection
async function start() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(MONGO_DB);
  const records = db.collection("records");

  const { actor } = await createActor();

  const app = express();
  app.use(bodyParser.json());

  // health
  app.get("/health", async (req, res) => {
    try {
      const s = await actor.status();
      res.json({ ok: true, status: s });
    } catch (e) {
      res.status(500).json({ ok: false, error: String(e) });
    }
  });

  // create record in Mongo and register pointer on chain
  app.post("/records", async (req, res) => {
    try {
      const { ownerPrincipal, meta, payload } = req.body;
      if (!ownerPrincipal || !meta || !payload) {
        return res.status(400).json({ error: "ownerPrincipal, meta, payload required" });
      }

      // store heavy payload in Mongo
      const insertRes = await records.insertOne({
        owner: ownerPrincipal,
        meta,
        payload,
        createdAt: new Date()
      });

      const objectId = insertRes.insertedId.toString();
      const storageProvider = `mongo://${MONGO_DB}/records/${objectId}`;
      const recordId = objectId;

      // call canister to add pointer
      const ownerPrincipalObj = Principal.fromText ? Principal.fromText(ownerPrincipal) : ownerPrincipal;
      // Because actor expects a Principal type, agent will handle conversion if string given
      const ok = await actor.addDataPointer(recordId, ownerPrincipal, meta, storageProvider);
      if (!ok) {
        return res.status(500).json({ error: "Canister rejected addDataPointer" });
      }

      res.json({ ok: true, id: recordId, storageProvider });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: String(e) });
    }
  });

  // fetch pointer + fetch payload
  app.get("/records/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const pointerOpt = await actor.getDataPointer(id);
      if (!pointerOpt || pointerOpt.length === 0) {
        return res.status(404).json({ error: "not found or access denied" });
      }
      const pointer = pointerOpt[0]; // actor returns Opt of record; agent wraps differently
      // parse storageProvider (we used mongo://db/collection/id)
      // naive parse:
      const s = pointer.storageProvider;
      const parts = s.split("/");
      const oid = parts[parts.length - 1];
      const record = await records.findOne({ _id: new ObjectId(oid) });
      if (!record) return res.status(404).json({ error: "mongo not found" });
      res.json({ pointer, record });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: String(e) });
    }
  });

  app.listen(PORT, () => console.log(`Integration service running on ${PORT}`));
}

start().catch(err => {
  console.error("Failed to start integration service:", err);
  process.exit(1);
});
