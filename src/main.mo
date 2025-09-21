// Add these new endpoints to your main actor

// Get user dashboard data (composite endpoint)
public shared ({ caller }) func getUserDashboardData() : async ?{
  profile: UserProfile;
  healthRecords: [HealthRecord];
  financialRecords: [FinancialRecord];
} {
  switch (await userData.getUserProfile()) {
    case (?userProfile) {
      let healthRecords = await healthRecordsCanister.getUserRecords(Principal.toText(caller));
      let financialRecords = await financialRecordsCanister.getUserRecords(Principal.toText(caller));
      
      return ?{
        profile = userProfile;
        healthRecords = healthRecords;
        financialRecords = financialRecords;
      };
    };
    case null { return null; };
  };
};

// Get detailed claim information
public query func getClaimDetails(claimId: Text) : async ?Claim {
  return await claimsCanister.getClaim(claimId);
};

// Submit claim with fraud detection
public shared ({ caller }) func submitClaimWithFraudDetection(
  healthRecordId: Text,
  amount: Nat
) : async {
  claimId: Text;
  fraudResult: FraudDetectionResult;
} {
  // Get user history
  let userProfile = await userData.getUserProfile();
  let healthHistory = switch (userProfile) {
    case (?profile) { profile.healthData };
    case null { [] };
  };
  
  let financialHistory = switch (userProfile) {
    case (?profile) { profile.financialData };
    case null { [] };
  };
  
  // Run fraud detection
  let fraudResult = await aiModel.detectFraud(amount, healthHistory, financialHistory);
  
  // Submit claim
  let claimId = await claims.submitClaim(healthRecordId, amount);
  
  return {
    claimId = claimId;
    fraudResult = fraudResult;
  };
};
