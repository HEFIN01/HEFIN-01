// user_data_canister.mo
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";

actor UserDataCanister {
  type UserProfile = {
    id: Principal;
    name: Text;
    healthData: [Text]; // Encrypted health record IDs
    financialData: [Text]; // Encrypted financial record IDs
  };

  private stable var users : HashMap.HashMap<Principal, UserProfile> = HashMap.HashMap<Principal, UserProfile>(0, Principal.equal, Principal.hash);
  private var nextId : Nat = 0;

  public shared ({ caller }) func createUser(name: Text) : async Text {
    let newUser : UserProfile = {
      id = caller;
      name = name;
      healthData = [];
      financialData = [];
    };
    users.put(caller, newUser);
    return "User created successfully";
  };

  public shared ({ caller }) func getUserProfile() : async ?UserProfile {
    return users.get(caller);
  };

  public shared ({ caller }) func addHealthData(recordId: Text) : async Text {
    switch (users.get(caller)) {
      case (?user) {
        let updatedUser = {
          user with healthData = Array.append(user.healthData, [recordId])
        };
        users.put(caller, updatedUser);
        return "Health data added";
      };
      case null { return "User not found"; };
    };
  };

  public shared ({ caller }) func addFinancialData(recordId: Text) : async Text {
    switch (users.get(caller)) {
      case (?user) {
        let updatedUser = {
          user with financialData = Array.append(user.financialData, [recordId])
        };
        users.put(caller, updatedUser);
        return "Financial data added";
      };
      case null { return "User not found"; };
    };
  };
}
