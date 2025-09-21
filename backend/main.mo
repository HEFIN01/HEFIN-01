// main.mo (Orchestrator canister)
import UserDataCanister "user_data_canister";
import HealthRecordsCanister "health_records_canister";
import FinancialRecordsCanister "financial_records_canister";
import AIModelCanister "ai_model_canister";
import InsuranceClaimsCanister "insurance_claims_canister";

actor HEFIN {
  // Initialize canisters
  private let userData = actor (Principal.toText(Principal.fromActor(this)) # ".user_data_canister") : UserDataCanister.UserDataCanister;
  private let healthRecords = actor (Principal.toText(Principal.fromActor(this)) # ".health_records_canister") : HealthRecordsCanister.HealthRecordsCanister;
  private let financialRecords = actor (Principal.toText(Principal.fromActor(this)) # ".financial_records_canister") : FinancialRecordsCanister.FinancialRecordsCanister;
  private let aiModel = actor (Principal.toText(Principal.fromActor(this)) # ".ai_model_canister") : AIModelCanister.AIModelCanister;
  private let claims = actor (Principal.toText(Principal.fromActor(this)) # ".insurance_claims_canister") : InsuranceClaimsCanister.InsuranceClaimsCanister;

  // User management
  public shared ({ caller }) func createUser(name: Text) : async Text {
    return await userData.createUser(name);
  };

  public shared ({ caller }) func getUserProfile() : async ?UserDataCanister.UserProfile {
    return await userData.getUserProfile();
  };

  // Health records
  public shared ({ caller }) func addHealthRecord(recordType: Text, data: Text) : async Text {
    let recordId = await healthRecords.createRecord(recordType, data);
    return await userData.addHealthData(recordId);
  };

  public query func getHealthRecord(recordId: Text) : async ?HealthRecordsCanister.HealthRecord {
    return await healthRecords.getRecord(recordId);
  };

  // Financial records
  public shared ({ caller }) func addFinancialRecord(recordType: Text, data: Text) : async Text {
    let recordId = await financialRecords.createRecord(recordType, data);
    return await userData.addFinancialData(recordId);
  };

  public query func getFinancialRecord(recordId: Text) : async ?FinancialRecordsCanister.FinancialRecord {
    return await financialRecords.getRecord(recordId);
  };

  // Insurance claims
  public shared ({ caller }) func submitInsuranceClaim(healthRecordId: Text, amount: Nat) : async Text {
    return await claims.submitClaim(healthRecordId, amount);
  };

  public query func getClaimStatus(claimId: Text) : async ?InsuranceClaimsCanister.ClaimStatus {
    return await claims.getClaimStatus(claimId);
  };
}
