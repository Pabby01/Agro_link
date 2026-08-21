// =============================================================================
// AGROLINK BACKEND KYB / KYC GOVERNANCE & COMPLIANCE SERVICE
// Corporate Affairs Commission (CAC), TIN, NIN & Document Verification
// =============================================================================

import { db, type DBKYBVerification } from "./db";

export class KYBController {
  /**
   * Submit Company Documents for KYB Review
   */
  static submitVerification(
    userId: string,
    data: {
      companyName: string;
      cacRcNumber: string;
      tinNumber?: string;
      directorNinBvn?: string;
      businessAddress: string;
      documentUrls: Record<string, string>;
    },
  ): { success: boolean; data?: DBKYBVerification; error?: string } {
    const user = db.users.get(userId);
    if (!user) {
      return { success: false, error: "User profile not found." };
    }

    const cleanCAC = data.cacRcNumber.trim().toUpperCase();
    if (
      !cleanCAC.startsWith("RC-") &&
      !cleanCAC.startsWith("BN-") &&
      !cleanCAC.startsWith("IT-") &&
      cleanCAC.length < 5
    ) {
      return {
        success: false,
        error: "Invalid Nigerian CAC Number format. Example: RC-1849204 or BN-492019.",
      };
    }

    const kybId = `kyb-${Date.now()}`;
    const verification: DBKYBVerification = {
      id: kybId,
      user_id: userId,
      company_name: data.companyName.trim(),
      cac_rc_number: cleanCAC,
      tin_number: data.tinNumber?.trim(),
      director_nin_bvn: data.directorNinBvn?.trim(),
      business_address: data.businessAddress.trim(),
      document_urls: data.documentUrls,
      status: "pending_review",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.kybVerifications.set(verification.id, verification);
    db.logAudit(userId, "KYB_DOCUMENTS_SUBMITTED", "kyb_verifications", kybId, {
      cacRcNumber: cleanCAC,
      companyName: data.companyName,
    });

    return {
      success: true,
      data: verification,
    };
  }

  /**
   * Get KYB Status for a User
   */
  static getStatus(userId: string): DBKYBVerification | null {
    for (const kyb of db.kybVerifications.values()) {
      if (kyb.user_id === userId) {
        return kyb;
      }
    }
    return null;
  }

  /**
   * List all KYB Verifications for Admin Review
   */
  static listAllForAdmin(): DBKYBVerification[] {
    return Array.from(db.kybVerifications.values()).sort(
      (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
    );
  }

  /**
   * Admin Review: Approve or Reject KYB Verification
   */
  static reviewVerification(
    adminId: string,
    data: {
      kybId: string;
      approved: boolean;
      tier?: 2 | 3;
      rejectionReason?: string;
    },
  ): { success: boolean; error?: string } {
    const admin = db.users.get(adminId);
    if (!admin || admin.role !== "admin") {
      return { success: false, error: "Unauthorized. Admin privileges required." };
    }

    const kyb = db.kybVerifications.get(data.kybId);
    if (!kyb) {
      return { success: false, error: "KYB verification record not found." };
    }

    if (data.approved) {
      kyb.status = "verified";
      kyb.rejection_reason = undefined;
      kyb.reviewed_by = adminId;
      kyb.reviewed_at = new Date().toISOString();
      kyb.updated_at = new Date().toISOString();

      // Upgrade User Tier & Mark Verified
      const targetUser = db.users.get(kyb.user_id);
      if (targetUser) {
        targetUser.is_verified = true;
        targetUser.kyb_tier = data.tier ?? 2;
        targetUser.business_name = kyb.company_name;
        targetUser.updated_at = new Date().toISOString();
        db.users.set(targetUser.id, targetUser);

        // Boost Trust Profile Score
        const trust = db.trustProfiles.get(targetUser.id);
        if (trust) {
          trust.verified = true;
          trust.score = Math.min(100, trust.score + 10);
          trust.history.unshift({
            date: new Date().toISOString().slice(0, 10),
            score: trust.score,
            reason: `KYB Compliance Verification Approved (Tier ${targetUser.kyb_tier})`,
          });
          trust.updated_at = new Date().toISOString();
        }
      }

      db.logAudit(adminId, "KYB_APPROVED", "kyb_verifications", kyb.id, {
        userId: kyb.user_id,
        tier: data.tier ?? 2,
      });
    } else {
      kyb.status = "rejected";
      kyb.rejection_reason = data.rejectionReason || "Documents failed validation criteria.";
      kyb.reviewed_by = adminId;
      kyb.reviewed_at = new Date().toISOString();
      kyb.updated_at = new Date().toISOString();

      db.logAudit(adminId, "KYB_REJECTED", "kyb_verifications", kyb.id, {
        userId: kyb.user_id,
        reason: kyb.rejection_reason,
      });
    }

    db.kybVerifications.set(kyb.id, kyb);
    return { success: true };
  }
}
