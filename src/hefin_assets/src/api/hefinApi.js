import { createActor } from "../../declarations/hefin";
import { AuthClient } from "@dfinity/auth-client";

// Canister ID from environment
const canisterId = process.env.CANISTER_ID_HEFIN;

// Create authenticated actor
export const createAuthenticatedActor = async () => {
  const authClient = await AuthClient.create();
  const identity = authClient.getIdentity();
  
  return createActor(canisterId, {
    agentOptions: {
      identity,
    },
  });
};

// API Service Class
class HefinApiService {
  constructor() {
    this.actor = null;
  }

  async init() {
    this.actor = await createAuthenticatedActor();
  }

  // User Management APIs
  async createUser(name) {
    return await this.actor.createUser(name);
  }

  async getUserProfile() {
    return await this.actor.getUserProfile();
  }

  // Health Record APIs
  async addHealthRecord(recordType, encryptedData) {
    return await this.actor.addHealthRecord(recordType, encryptedData);
  }

  async getHealthRecord(recordId) {
    return await this.actor.getHealthRecord(recordId);
  }

  async getHealthRecords(recordIds) {
    return Promise.all(recordIds.map(id => this.getHealthRecord(id)));
  }

  // Financial Record APIs
  async addFinancialRecord(recordType, encryptedData) {
    return await this.actor.addFinancialRecord(recordType, encryptedData);
  }

  async getFinancialRecord(recordId) {
    return await this.actor.getFinancialRecord(recordId);
  }

  async getFinancialRecords(recordIds) {
    return Promise.all(recordIds.map(id => this.getFinancialRecord(id)));
  }

  // Insurance Claims APIs
  async submitInsuranceClaim(healthRecordId, amount) {
    return await this.actor.submitInsuranceClaim(healthRecordId, amount);
  }

  async getClaimStatus(claimId) {
    return await this.actor.getClaimStatus(claimId);
  }

  // Composite APIs
  async getUserDashboardData() {
    const profile = await this.getUserProfile();
    if (!profile) return null;

    const [healthRecords, financialRecords] = await Promise.all([
      this.getHealthRecords(profile.healthData),
      this.getFinancialRecords(profile.financialData)
    ]);

    return {
      profile,
      healthRecords: healthRecords.filter(Boolean),
      financialRecords: financialRecords.filter(Boolean)
    };
  }

  // Fraud Detection API
  async detectFraud(claimAmount, healthHistory, financialHistory) {
    return await this.actor.detectFraud(
      claimAmount,
      healthHistory,
      financialHistory
    );
  }
}

// Export singleton instance
export const hefinApi = new HefinApiService();
