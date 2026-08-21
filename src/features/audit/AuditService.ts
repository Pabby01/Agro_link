// =============================================================================
// AGROLINK CENTRALIZED AUDIT SERVICE
// Immutable transaction & governance event logging
// =============================================================================

import type { AuditAction, AuditLog, Role } from "@/types/domain";

export class AuditService {
  private static logs: AuditLog[] = [];

  /**
   * Records a business event into the audit trail with sanitized metadata.
   */
  public static log(input: {
    actorId: string;
    actorRole: Role;
    action: AuditAction;
    entityType: AuditLog["entityType"];
    entityId: string;
    metadata?: Record<string, unknown> | undefined;
  }): AuditLog {
    const sanitizedMetadata: Record<string, unknown> = {};

    if (input.metadata) {
      for (const [key, val] of Object.entries(input.metadata)) {
        // Exclude potential sensitive tokens, passwords, or secret hashes
        if (
          !key.toLowerCase().includes("password") &&
          !key.toLowerCase().includes("secret") &&
          !key.toLowerCase().includes("token")
        ) {
          sanitizedMetadata[key] = val;
        }
      }
    }

    const entry: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actorId: input.actorId,
      actorRole: input.actorRole,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      timestamp: new Date().toISOString(),
      metadata: sanitizedMetadata,
    };

    this.logs.unshift(entry);
    if (this.logs.length > 500) {
      this.logs.pop();
    }

    return entry;
  }

  /**
   * Retrieves recent audit logs with optional filters.
   */
  public static getLogs(limit = 100): AuditLog[] {
    return this.logs.slice(0, limit);
  }
}
