// =============================================================================
// AGROLINK TRUST & REPUTATION ENGINE
// Transparent, measurable, non-blackbox scoring model
// =============================================================================

import type { TrustProfile, TrustEvent, TrustEventType, TrustLevel } from "@/types/domain";

export class TrustScoreService {
  public static readonly BASE_SCORE = 70;
  public static readonly VERIFICATION_BONUS = 15;
  public static readonly SUCCESSFUL_TRANSACTION_BONUS = 2;
  public static readonly HIGH_RATING_BONUS = 3; // Rating >= 4.5
  public static readonly LOW_RATING_PENALTY = 8; // Rating <= 2.5
  public static readonly CANCELLATION_PENALTY = 10;
  public static readonly DISPUTE_PENALTY = 15;
  public static readonly LATE_DELIVERY_PENALTY = 5;

  /**
   * Determine trust level tier based on 0-100 score.
   */
  public static getLevel(score: number): TrustLevel {
    if (score >= 90) return "High Trust";
    if (score >= 75) return "Trusted";
    if (score >= 50) return "Building Trust";
    return "New";
  }

  /**
   * Recalculates reputation score from measurable event components.
   */
  public static calculateScore(profile: {
    isVerified: boolean;
    completedTransactions: number;
    cancelledOrders: number;
    disputeRate: number;
    lateRate: number;
    rating: number;
  }): number {
    let score = this.BASE_SCORE;

    if (profile.isVerified) {
      score += this.VERIFICATION_BONUS;
    }

    // Success bonus (capped at +20)
    const successPoints = Math.min(
      20,
      profile.completedTransactions * this.SUCCESSFUL_TRANSACTION_BONUS,
    );
    score += successPoints;

    // Rating contribution
    if (profile.rating >= 4.5 && profile.completedTransactions > 0) {
      score += this.HIGH_RATING_BONUS;
    } else if (profile.rating <= 2.5 && profile.completedTransactions > 0) {
      score -= this.LOW_RATING_PENALTY;
    }

    // Penalties
    score -= profile.cancelledOrders * this.CANCELLATION_PENALTY;

    if (profile.disputeRate > 5) {
      score -= Math.round((profile.disputeRate / 5) * this.DISPUTE_PENALTY);
    }

    if (profile.lateRate > 10) {
      score -= Math.round((profile.lateRate / 10) * this.LATE_DELIVERY_PENALTY);
    }

    // Clamp strictly between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Applies a specific trust event to a profile and updates history.
   */
  public static applyEvent(
    profile: TrustProfile,
    type: TrustEventType,
    reason: string,
    referenceId?: string,
  ): TrustProfile {
    let delta = 0;

    switch (type) {
      case "VERIFICATION_COMPLETED":
        delta = this.VERIFICATION_BONUS;
        break;
      case "TRANSACTION_COMPLETED":
      case "DELIVERY_COMPLETED":
        delta = this.SUCCESSFUL_TRANSACTION_BONUS;
        break;
      case "POSITIVE_REVIEW":
        delta = this.HIGH_RATING_BONUS;
        break;
      case "NEGATIVE_REVIEW":
        delta = -this.LOW_RATING_PENALTY;
        break;
      case "ORDER_CANCELLED":
        delta = -this.CANCELLATION_PENALTY;
        break;
      case "DISPUTE_OPENED":
        delta = -this.DISPUTE_PENALTY;
        break;
      case "DISPUTE_RESOLVED":
        delta = Math.round(this.DISPUTE_PENALTY / 2); // Partial restoration
        break;
      case "LATE_DELIVERY":
        delta = -this.LATE_DELIVERY_PENALTY;
        break;
    }

    const newScore = Math.max(0, Math.min(100, profile.score + delta));
    const now = new Date().toISOString();

    const event: TrustEvent = {
      id: `te-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: profile.userId,
      type,
      scoreDelta: delta,
      resultingScore: newScore,
      reason,
      referenceId,
      timestamp: now,
    };

    const isCompleted = type === "TRANSACTION_COMPLETED" || type === "DELIVERY_COMPLETED";
    const isCancelled = type === "ORDER_CANCELLED";
    const isLate = type === "LATE_DELIVERY";

    const completedTransactions = profile.completedTransactions + (isCompleted ? 1 : 0);
    const cancelledOrders = profile.cancelledOrders + (isCancelled ? 1 : 0);
    const totalOrders = completedTransactions + cancelledOrders;

    const fulfilmentRate =
      totalOrders > 0 ? Math.round((completedTransactions / totalOrders) * 100) : 100;
    const cancellationRate =
      totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0;

    return {
      ...profile,
      score: newScore,
      level: this.getLevel(newScore),
      completedTransactions,
      cancelledOrders,
      successfulDeliveries: profile.successfulDeliveries + (type === "DELIVERY_COMPLETED" ? 1 : 0),
      successfulOrders: profile.successfulOrders + (type === "TRANSACTION_COMPLETED" ? 1 : 0),
      fulfilmentRate,
      cancellationRate,
      isVerified: type === "VERIFICATION_COMPLETED" ? true : profile.isVerified,
      history: [event, ...profile.history],
      updatedAt: now,
    };
  }

  /**
   * Initializes a clean default trust profile for a new user.
   */
  public static createInitialProfile(userId: string, isVerified = false): TrustProfile {
    const score = isVerified ? this.BASE_SCORE + this.VERIFICATION_BONUS : this.BASE_SCORE;
    return {
      userId,
      score,
      level: this.getLevel(score),
      rating: 5.0,
      completedTransactions: 0,
      successfulDeliveries: 0,
      successfulOrders: 0,
      cancelledOrders: 0,
      fulfilmentRate: 100,
      cancellationRate: 0,
      disputeRate: 0,
      lateRate: 0,
      isVerified,
      history: [
        {
          id: `te-init-${userId}`,
          userId,
          type: isVerified ? "VERIFICATION_COMPLETED" : "TRANSACTION_COMPLETED",
          scoreDelta: 0,
          resultingScore: score,
          reason: isVerified
            ? "Account verified with CAC credentials"
            : "Initial onboarding base score",
          timestamp: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    };
  }
}
