import type { KVSession } from "./utils/kv-session";

// Guest session types
export interface GuestSession {
  id: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  country?: string;
  city?: string;
  tempData?: Record<string, any>;
  lastActivityAt: number;
  expiresAt: number;
  apiCallCount: number;
  lastApiCallAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface GuestFeatureAccess {
  canViewDashboard: boolean;
  canAccessMarketplace: boolean;
  canViewComponents: boolean;
  canMakePurchases: boolean;
  canCreateTeams: boolean;
  canAccessBilling: boolean;
  apiCallLimit: number;
  sessionDurationHours: number;
}

export const DEFAULT_GUEST_FEATURES: GuestFeatureAccess = {
  canViewDashboard: true,
  canAccessMarketplace: true,
  canViewComponents: true,
  canMakePurchases: false,
  canCreateTeams: false,
  canAccessBilling: false,
  apiCallLimit: 50,
  sessionDurationHours: 2,
};

export type SessionValidationResult =
  | KVSession
  | { type: 'guest'; session: GuestSession; features: GuestFeatureAccess }
  | null;

export interface ParsedUserAgent {
  ua: string;
  browser: {
    name?: string;
    version?: string;
    major?: string;
  };
  device: {
    model?: string;
    type?: string;
    vendor?: string;
  };
  engine: {
    name?: string;
    version?: string;
  };
  os: {
    name?: string;
    version?: string;
  };
}

export interface SessionWithMeta extends KVSession {
  isCurrentSession: boolean;
  expiration?: Date;
  createdAt: number;
  userAgent?: string | null;
  parsedUserAgent?: ParsedUserAgent;
}
