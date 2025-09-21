// health_records_canister.mo
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";

actor HealthRecordsCanister {
  type HealthRecord = {
    id: Text;
    userId: Text; // Principal.toText()
    recordType: Text;
    data: Text; // Encrypted health data
    timestamp: Int;
  };

  private stable var records : HashMap.HashMap<Text, HealthRecord> = HashMap.HashMap<Text, Text>(0, Text.equal, Text.hash);
  private var nextId : Nat = 0;

  public shared ({ caller }) func createRecord(recordType: Text, data: Text) : async Text {
    let recordId = "health_" # Nat.toText(nextId);
    nextId += 1;
    
    let newRecord : HealthRecord = {
      id = recordId;
      userId = Principal.toText(caller);
      recordType = recordType;
      data = data;
      timestamp = Int.abs(Time.now());
    };
    
    records.put(recordId, newRecord);
    return recordId;
  };

  public query func getRecord(recordId: Text) : async ?HealthRecord {
    return records.get(recordId);
  };

  public query func getUserRecords(userId: Text) : async [HealthRecord] {
    return Iter.toArray(Iter.filter(
      records.vals(),
      func (r: HealthRecord) : Bool { r.userId == userId }
    ));
  };
}
