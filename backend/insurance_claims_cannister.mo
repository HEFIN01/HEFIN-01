// insurance_claims_canister.mo
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Principal "mo:base/Principal";

actor InsuranceClaimsCanister {
  type ClaimStatus = { #Submitted; #Approved; #Rejected; #UnderReview };
  
  type Claim = {
    id: Text;
    userId: Text;
    healthRecordId: Text;
    amount: Nat;
    status: ClaimStatus;
    timestamp: Int;
    notes: Text;
  };

  private stable var claims : HashMap.HashMap<Text, Claim> = HashMap.HashMap<Text, Claim>(0, Text.equal, Text.hash);
  private var nextId : Nat = 0;
  
  // AI model canister reference (would be set during deployment)
  private var aiModel : actor { 
    detectFraud : (Nat, [Text], [Text]) -> async { 
      isFraudulent: Bool; 
      confidence: Float; 
      reasons: [Text] 
    } 
  };

  public shared ({ caller }) func submitClaim(
    healthRecordId: Text, 
    amount: Nat
  ) : async Text {
    let claimId = "claim_" # Nat.toText(nextId);
    nextId += 1;
    
    let newClaim : Claim = {
      id = claimId;
      userId = Principal.toText(caller);
      healthRecordId = healthRecordId;
      amount = amount;
      status = #Submitted;
      timestamp = Int.abs(Time.now());
      notes = "";
    };
    
    claims.put(claimId, newClaim);
    
    // Automated fraud detection
    let fraudResult = await aiModel.detectFraud(
      amount, 
      [], // Would fetch from health records canister
      []  // Would fetch from financial records canister
    );
    
    if (fraudResult.isFraudulent and fraudResult.confidence > 0.7) {
      let updatedClaim = {
        newClaim with 
        status = #Rejected;
        notes = "Rejected by AI: " # Text.join(", ", fraudResult.reasons.vals());
      };
      claims.put(claimId, updatedClaim);
    } else {
      let updatedClaim = {
        newClaim with 
        status = #UnderReview;
        notes = "Under review by AI";
      };
      claims.put(claimId, updatedClaim);
    };
    
    return claimId;
  };

  public query func getClaimStatus(claimId: Text) : async ?ClaimStatus {
    switch (claims.get(claimId)) {
      case (?claim) { return ?claim.status; };
      case null { return null; };
    };
  };

  public shared ({ caller }) func updateClaimStatus(
    claimId: Text, 
    status: ClaimStatus,
    notes: Text
  ) : async Text {
    switch (claims.get(claimId)) {
      case (?claim) {
        let updatedClaim = {
          claim with 
          status = status;
          notes = notes;
        };
        claims.put(claimId, updatedClaim);
        return "Claim status updated";
      };
      case null { return "Claim not found"; };
    };
  };
}
