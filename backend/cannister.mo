import Map "mo:base/Map";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";

// Define the data structures for health and financial records.
// In a real-world application, these would be more complex and encrypted.
type Record = {
  recordType : Text; // "health" or "finance"
  title : Text;
  details : Text;
  timestamp : Nat;
};

// A stable data structure to persist user data across canister upgrades.
// The key is the user's Principal (their identity), and the value is a list of their records.
// This replaces an external database like MongoDB.
stable var userRecords = Map.empty<Principal.Principal, [Record]>(Principal.equal);

// This is the public API for the backend canister.
actor {
  
  // A helper function to get the caller's principal (identity).
  // This is how the canister knows who is calling the function.
  public query func getCallerPrincipal() : async Principal.Principal {
    return Principal.fromActor(caller);
  };
  
  // An update function to add a new record for the current user.
  // 'update' functions change the canister's state, so they are slower but persistent.
  public shared(msg) func addRecord(recordType : Text, title : Text, details : Text) : async () {
    let callerPrincipal = Principal.fromActor(caller);
    let newRecord = {
      recordType = recordType;
      title = title;
      details = details;
      timestamp = Time.now(); // `Time.now()` is a placeholder, a real timestamp would be more robust.
    };
    
    // Check if the user already has records.
    switch (userRecords.get(callerPrincipal)) {
      case (null) {
        // If no records exist, create a new list with the new record.
        userRecords.put(callerPrincipal, [newRecord]);
      };
      case (var existingRecords) {
        // If records exist, append the new one to the list.
        userRecords.put(callerPrincipal, existingRecords @ [newRecord]);
      };
    };
  };
  
  // A query function to retrieve all records for the current user.
  // 'query' functions do not change state and are much faster.
  public query func getRecords() : async [Record] {
    let callerPrincipal = Principal.fromActor(caller);
    switch (userRecords.get(callerPrincipal)) {
      case (null) {
        // Return an empty list if no records are found.
        return [];
      };
      case (var records) {
        // Return the user's records.
        return records;
      };
    };
  };
