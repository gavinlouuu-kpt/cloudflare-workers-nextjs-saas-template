import { SessionValidationResult, GuestSession, GuestFeatureAccess } from '@/types';
import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { KVSession } from '@/utils/kv-session';

// Team member type extracted from KVSession for type safety
type TeamMember = NonNullable<KVSession['teams']>[number];

interface SessionState {
  session: SessionValidationResult | null;
  isLoading: boolean;
  lastFetched: Date | null;
  fetchSession?: () => Promise<void>;
}

interface SessionActions {
  setSession: (session: SessionValidationResult) => void;
  clearSession: () => void;
  refetchSession: () => void;

  // Session type helpers
  isGuestSession: () => boolean;
  isUserSession: () => boolean;
  getGuestSession: () => GuestSession | null;
  getUserSession: () => KVSession | null;
  getGuestFeatures: () => GuestFeatureAccess | null;

  // Team related selectors (only for user sessions)
  teams: () => KVSession['teams'] | undefined;
  isTeamMember: (teamId: string) => boolean;
  hasTeamRole: (teamId: string, roleId: string, isSystemRole?: boolean) => boolean;
  hasTeamPermission: (teamId: string, permission: string) => boolean;
  getTeam: (teamId: string) => TeamMember | undefined;
}

export const useSessionStore = create(
  combine(
    {
      session: null as SessionValidationResult | null,
      isLoading: true,
      lastFetched: null as Date | null,
      fetchSession: undefined,
    } as SessionState,
    (set, get) => ({
      setSession: (session: SessionValidationResult) => set({ session, isLoading: false, lastFetched: new Date() }),
      clearSession: () => set({ session: null, isLoading: false, lastFetched: null }),
      refetchSession: () => set({ isLoading: true }),

      // Session type helpers
      isGuestSession: () => {
        const session = get().session;
        return session !== null && 'type' in session && session.type === 'guest';
      },

      isUserSession: () => {
        const session = get().session;
        return session !== null && !('type' in session);
      },

      getGuestSession: () => {
        const session = get().session;
        if (session && 'type' in session && session.type === 'guest') {
          return session.session;
        }
        return null;
      },

      getUserSession: () => {
        const session = get().session;
        if (session && !('type' in session)) {
          return session;
        }
        return null;
      },

      getGuestFeatures: () => {
        const session = get().session;
        if (session && 'type' in session && session.type === 'guest') {
          return session.features;
        }
        return null;
      },

      // Team related selectors (only work for user sessions)
      teams: () => {
        const session = get().session;
        if (session && !('type' in session)) {
          return session.teams;
        }
        return undefined;
      },

      isTeamMember: (teamId: string) => {
        const session = get().session;
        if (session && !('type' in session)) {
          return !!session.teams?.some((team: TeamMember) => team.id === teamId);
        }
        return false;
      },

      hasTeamRole: (teamId: string, roleId: string, isSystemRole: boolean = false) => {
        const session = get().session;
        if (session && !('type' in session)) {
          const team = session.teams?.find((t: TeamMember) => t.id === teamId);
          if (!team) return false;

          if (isSystemRole) {
            return team.role.isSystemRole && team.role.id === roleId;
          }

          return !team.role.isSystemRole && team.role.id === roleId;
        }
        return false;
      },

      hasTeamPermission: (teamId: string, permission: string) => {
        const session = get().session;
        if (session && !('type' in session)) {
          const team = session.teams?.find((t: TeamMember) => t.id === teamId);
          if (!team) return false;

          return team.permissions.includes(permission);
        }
        return false;
      },

      getTeam: (teamId: string) => {
        const session = get().session;
        if (session && !('type' in session)) {
          return session.teams?.find((t: TeamMember) => t.id === teamId);
        }
        return undefined;
      }
    } as SessionActions)
  )
)
