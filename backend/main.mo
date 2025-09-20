// src/backend/main.mo
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Time "mo:base/Time";

actor Backend {

  // Basic types
  public type RecordId = Text;
  public type UserId = Principal;

  public type DataPointer = {
    id: RecordId;
    owner: UserId;
    createdAt: Time.Time;
    meta: Text;               // small metadata, e.g., JSON string with summary or pointer
    storageProvider: Text;    // e.g. "mongo://<collection>/<id>"
  };

  // Simple stable storage
  stable var records : Trie.Trie<Text, DataPointer> = Trie.Trie(null);
  stable var admin : ?Principal = null;

  // Init admin when actor is first installed
  public shared({caller}) func init() : async () {
    switch (admin) {
      case (null) {
        admin := ?caller;
        Debug.print("Backend initialized. Admin = " # Principal.toText(caller));
      }
      case (_) {
        Debug.print("Backend re-instantiated.");
      }
    };
  };

  // Helper: check admin
  func isAdmin(p : Principal) : Bool {
    switch (admin) {
      case (?a) { a == p };
      case (null) { false };
    }
  };

  // Add a pointer to data (called by integration service)
  // integration service must be allowed via off-chain configuration or by using a privileged identity
  public shared (update) func addDataPointer(id : RecordId, owner : UserId, meta : Text, storageProvider : Text) : async Bool {
    let caller = await Actor.caller();
    // Only admin or the owner can create a pointer for now
    if (!(isAdmin(caller) or caller == owner)) {
      Debug.print("addDataPointer: unauthorized " # Principal.toText(caller));
      return false;
    };

    let p : DataPointer = {
      id = id;
      owner = owner;
      createdAt = Time.now();
      meta = meta;
      storageProvider = storageProvider;
    };

    Trie.put(records, id, p);
    Debug.print("addDataPointer: stored " # id);
    return true;
  };

  // Get pointer by id (anyone who is owner or admin)
  public shared(query) func getDataPointer(id : RecordId) : async ?DataPointer {
    let caller = await Actor.caller();
    switch (Trie.get(records, id)) {
      case (null) { null };
      case (?p) {
        if (caller == p.owner or isAdmin(caller)) {
          ?p
        } else {
          // hide pointer if not allowed
          null
        }
      }
    }
  };

  // List pointers owned by a principal (simple iteration)
  public shared(query) func listPointersFor(owner : UserId) : async [DataPointer] {
    var out : [DataPointer] = [];
    Trie.iter(records, func(k, v) {
      switch (v) {
        case (?p) {
          if (p.owner == owner) { out := Array.concat(out, [p]); };
        }
        case (null) {}
      };
      true
    });
    return out;
  };

  // Admin-only: set admin to new principal
  public shared (update) func setAdmin(newAdmin : Principal) : async Bool {
    let caller = await Actor.caller();
    if (!isAdmin(caller)) { return false; };
    admin := ?newAdmin;
    true
  };

  // Basic health check
  public shared(query) func status() : async Text {
    "HEFIN Backend canister: ok"
  };
}
