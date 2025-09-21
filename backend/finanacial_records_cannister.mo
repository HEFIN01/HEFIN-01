// financial_records_canister.mo
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";

actor FinancialRecordsCanister {
  type FinancialRecord = {
    id: Text;
    userId: Text; // Principal.toText()
    recordType: Text;
    data: Text; // Encrypted financial data
    timestamp: Int;
  };

  private stable var records : HashMap.HashMap<Text, FinancialRecord> = HashMap.HashMap<Text, Text>(0, Text.equal, Text.hash);
  private var nextId : Nat = 0;

  public shared ({ caller }) func createRecord(recordType: Text, data: Text) : async Text {
    let recordId = "finance_" # Nat.toText(nextId);
    nextId += 1;
    
    let newRecord : FinancialRecord = {
      id = recordId;
      userId = Principal.toText(caller);
      recordType = recordType;
      data = data;
      timestamp = Int.abs(Time.now());
    };
    
    records.put(recordId, newRecord);
    return recordId;
  };

  public query func getRecord(recordId: Text) : async ?FinancialRecord {
    return records.get(recordId);
  };

  public query func getUserRecords(userId: Text) : async [FinancialRecord] {
    return Iter.toArray(Iter.filter(
      records.vals(),
      func (r: FinancialRecord) : Bool { r.userId == userId }
    ));
  };
}
