// =============================================================================
// AGROLINK BACKEND AUTH CONTROLLER
// Registration, Login, Session Management, and Role Verification
// =============================================================================

import { db, type DBUser, type DBSession } from "./db";
import { generateSalt, hashPassword, verifyPassword, generateSessionToken } from "./crypto";

export interface AuthResponse {
  user: Omit<DBUser, "password_hash" | "password_salt">;
  sessionToken: string;
  expiresAt: string;
}

export class AuthController {
  /**
   * Register a new user with cryptographic password hashing
   */
  static async register(data: {
    email: string;
    password: string;
    role: "farmer" | "buyer" | "transporter";
    fullName: string;
    businessName: string;
    phone: string;
    locationName: string;
    latitude?: number;
    longitude?: number;
    bio?: string;
  }): Promise<{ success: boolean; data?: AuthResponse; error?: string }> {
    const cleanEmail = data.email.trim().toLowerCase();

    // Check duplicate
    for (const u of db.users.values()) {
      if (u.email.toLowerCase() === cleanEmail) {
        return { success: false, error: "An account with this email already exists." };
      }
    }

    if (!data.password || data.password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long." };
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(data.password, salt);
    const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const initials =
      data.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "AG";

    const newUser: DBUser = {
      id: userId,
      email: cleanEmail,
      password_hash: passwordHash,
      password_salt: salt,
      role: data.role,
      full_name: data.fullName.trim(),
      business_name: data.businessName.trim(),
      phone: data.phone.trim(),
      location_name: data.locationName.trim(),
      latitude: data.latitude ?? 9.082,
      longitude: data.longitude ?? 8.6753,
      avatar_initials: initials,
      bio: data.bio ?? "",
      kyb_tier: 1,
      is_verified: false,
      is_active: true,
      is_flagged: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.users.set(newUser.id, newUser);

    // Create Initial Trust Profile
    db.trustProfiles.set(newUser.id, {
      user_id: newUser.id,
      score: 80,
      level: "New",
      rating: 5.0,
      completed_transactions: 0,
      successful_deliveries: 0,
      cancelled_orders: 0,
      fulfilment_rate: 100,
      cancellation_rate: 0,
      verified: false,
      history: [
        {
          date: new Date().toISOString().slice(0, 10),
          score: 80,
          reason: "Account registered on Agrolink",
        },
      ],
      updated_at: new Date().toISOString(),
    });

    // Create Session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    const sessionId = `sess-${Date.now()}`;

    db.sessions.set(sessionToken, {
      id: sessionId,
      user_id: newUser.id,
      token_hash: sessionToken,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    });

    db.logAudit(newUser.id, "USER_REGISTERED", "users", newUser.id, {
      email: newUser.email,
      role: newUser.role,
    });

    const { password_hash: _, password_salt: __, ...safeUser } = newUser;
    return {
      success: true,
      data: {
        user: safeUser,
        sessionToken,
        expiresAt,
      },
    };
  }

  /**
   * Login with email and password
   */
  static async login(data: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; data?: AuthResponse; error?: string }> {
    const cleanEmail = data.email.trim().toLowerCase();
    let foundUser: DBUser | undefined;

    for (const u of db.users.values()) {
      if (u.email.toLowerCase() === cleanEmail) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      return { success: false, error: "Invalid email or password." };
    }

    if (!foundUser.is_active || foundUser.is_flagged) {
      return { success: false, error: "This account has been flagged or suspended by Compliance." };
    }

    const isValid = await verifyPassword(
      data.password,
      foundUser.password_hash,
      foundUser.password_salt,
    );
    if (!isValid) {
      return { success: false, error: "Invalid email or password." };
    }

    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const sessionId = `sess-${Date.now()}`;

    db.sessions.set(sessionToken, {
      id: sessionId,
      user_id: foundUser.id,
      token_hash: sessionToken,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    });

    db.logAudit(foundUser.id, "USER_LOGGED_IN", "users", foundUser.id, { email: foundUser.email });

    const { password_hash: _, password_salt: __, ...safeUser } = foundUser;
    return {
      success: true,
      data: {
        user: safeUser,
        sessionToken,
        expiresAt,
      },
    };
  }

  /**
   * Resolve user from session token
   */
  static getUserFromToken(token: string): Omit<DBUser, "password_hash" | "password_salt"> | null {
    if (!token) return null;
    const session = db.sessions.get(token);
    if (!session) return null;

    if (new Date(session.expires_at) < new Date()) {
      db.sessions.delete(token);
      return null;
    }

    const user = db.users.get(session.user_id);
    if (!user || !user.is_active) return null;

    const { password_hash: _, password_salt: __, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Switch role in demo mode and issue fresh backend session
   */
  static switchDemoRole(role: "farmer" | "buyer" | "transporter" | "admin"): AuthResponse {
    const roleIdMap: Record<string, string> = {
      farmer: "u-farmer-1",
      buyer: "u-buyer-1",
      transporter: "u-transporter-1",
      admin: "u-admin-1",
    };

    const targetId = roleIdMap[role] || "u-farmer-1";
    const user = db.users.get(targetId)!;

    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    db.sessions.set(sessionToken, {
      id: `sess-demo-${Date.now()}`,
      user_id: user.id,
      token_hash: sessionToken,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    });

    db.logAudit(user.id, "DEMO_ROLE_SWITCHED", "users", user.id, { role });

    const { password_hash: _, password_salt: __, ...safeUser } = user;
    return {
      user: safeUser,
      sessionToken,
      expiresAt,
    };
  }
}
