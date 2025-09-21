// ai_model_canister.mo
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Nat "mo:base/Nat";

actor AIModelCanister {
  type FraudDetectionResult = {
    isFraudulent: Bool;
    confidence: Float; // 0.0 to 1.0
    reasons: [Text];
  };

  // Simplified rule-based fraud detection
  public func detectFraud(
    claimAmount: Nat,
    userHealthHistory: [Text],
    userFinancialHistory: [Text]
  ) : async FraudDetectionResult {
    // Rule 1: High claim amount with minimal history
    let highAmount = claimAmount > 10000;
    let minimalHistory = userHealthHistory.size() < 2 or userFinancialHistory.size() < 2;
    
    // Rule 2: Recent activity patterns (simplified)
    let suspiciousActivity = userFinancialHistory.size() > 5 and claimAmount > 5000;
    
    var isFraud = false;
    var confidence = 0.0;
    var reasons : [Text] = [];
    
    if (highAmount and minimalHistory) {
      isFraud := true;
      confidence := 0.8;
      reasons := Array.append(reasons, ["High claim with minimal history"]);
    };
    
    if (suspiciousActivity) {
      isFraud := true;
      confidence := confidence + 0.15;
      reasons := Array.append(reasons, ["Suspicious activity pattern"]);
    };
    
    return {
      isFraudulent = isFraud;
      confidence = if (confidence > 1.0) 1.0 else confidence;
      reasons = reasons;
    };
  };
}
