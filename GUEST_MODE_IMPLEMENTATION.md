# Try-Before-Login Implementation Guide

This document outlines the complete implementation of the "try-before-login" feature that allows users to explore your SaaS platform without creating an account, with intelligent limitations and conversion prompts.

## 🏗️ Architecture Overview

The guest mode system consists of several key components:

1. **Guest Session Management** - Temporary sessions stored in Cloudflare D1
2. **Feature Gating** - UI components that restrict access to premium features
3. **Rate Limiting** - API call limits to prevent abuse
4. **Conversion Tracking** - Analytics and prompts to encourage sign-ups
5. **Auto Cleanup** - Scheduled removal of expired sessions

## 📁 Key Files and Components

### Core Utilities
- `src/utils/guest-session.ts` - Guest session CRUD operations
- `src/utils/auth.ts` - Extended authentication with guest support
- `src/utils/guest-rate-limit.ts` - Rate limiting for guest sessions
- `src/utils/guest-conversion.ts` - Conversion tracking and analytics

### UI Components
- `src/components/guest-mode-banner.tsx` - Top banner showing guest status
- `src/components/guest-feature-gate.tsx` - Feature access control
- `src/state/session.ts` - Updated Zustand store for guest sessions

### Database Schema
- `src/db/schema.ts` - Guest session and interaction tables
- Migration: `src/db/migrations/0009_add_guest_sessions.sql`

### API Routes
- `src/app/api/get-session/route.ts` - Updated to handle guest sessions
- `src/app/api/cleanup-guest-sessions/route.ts` - Cleanup endpoint

## 🎯 Features and Limitations

### What Guests Can Do
✅ View dashboard and marketplace  
✅ Browse components and previews  
✅ See feature demonstrations  
✅ Make up to 50 API calls per session  
✅ Use the platform for 2 hours  

### What Guests Cannot Do
❌ Purchase components  
❌ Create or join teams  
❌ Access billing features  
❌ Save permanent data  
❌ Make unlimited API calls  

## 🔧 Implementation Details

### 1. Database Schema

Two new tables were added:

```sql
-- Guest sessions with 2-hour expiration
CREATE TABLE guest_session (
  id TEXT PRIMARY KEY,
  sessionId TEXT UNIQUE NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  country TEXT,
  city TEXT,
  tempData TEXT, -- JSON storage
  lastActivityAt INTEGER NOT NULL,
  expiresAt INTEGER NOT NULL,
  apiCallCount INTEGER DEFAULT 0,
  lastApiCallAt INTEGER,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

-- Interaction tracking for analytics
CREATE TABLE guest_interaction (
  id TEXT PRIMARY KEY,
  guestSessionId TEXT NOT NULL,
  interactionType TEXT NOT NULL,
  interactionData TEXT, -- JSON storage
  ipAddress TEXT,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (guestSessionId) REFERENCES guest_session(id) ON DELETE CASCADE
);
```

### 2. Session Management

Guest sessions are automatically created when users visit the dashboard without authentication:

```typescript
// In src/utils/auth.ts
export const getSessionOrGuest = cache(async (): Promise<SessionValidationResult> => {
  // Try user session first
  const userSession = await getSessionFromCookie();
  if (userSession) return userSession;

  // Check for existing guest session
  const guestSessionId = cookieStore.get(GUEST_SESSION_COOKIE_NAME)?.value;
  if (guestSessionId) {
    const guestSession = await validateGuestSession(guestSessionId);
    if (guestSession) {
      return { type: 'guest', session: guestSession, features: getGuestFeatureAccess() };
    }
  }

  // Create new guest session
  const newGuestSession = await createGuestSession();
  await setGuestSessionCookie(newGuestSession.sessionId, new Date(newGuestSession.expiresAt));
  
  return { type: 'guest', session: newGuestSession, features: getGuestFeatureAccess() };
});
```

### 3. Feature Gating

The `GuestFeatureGate` component controls access to premium features:

```tsx
<GuestFeatureGate feature="canMakePurchases">
  <PurchaseButton itemId={id} itemType="COMPONENT" />
</GuestFeatureGate>
```

Features are configured in `src/types.ts`:

```typescript
export const DEFAULT_GUEST_FEATURES: GuestFeatureAccess = {
  canViewDashboard: true,
  canAccessMarketplace: true,
  canViewComponents: true,
  canMakePurchases: false,      // ❌ Requires account
  canCreateTeams: false,        // ❌ Requires account
  canAccessBilling: false,      // ❌ Requires account
  apiCallLimit: 50,
  sessionDurationHours: 2,
};
```

### 4. UI Indicators

#### Guest Mode Banner
Displays at the top of the dashboard showing:
- Remaining session time
- API calls left
- Prominent sign-up/sign-in buttons

#### Marketplace Cards
Show "Preview Only" buttons for guest users instead of purchase buttons.

#### Navigation
Hides team and billing sections for guest users.

### 5. Rate Limiting

Prevents abuse with API call limits:

```typescript
export async function checkGuestRateLimit(sessionId: string): Promise<{ allowed: boolean; remaining: number }> {
  const session = await db.query.guestSessionTable.findFirst({
    where: eq(guestSessionTable.sessionId, sessionId),
  });

  if (session.apiCallCount >= GUEST_API_RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  // Increment and return remaining
  await incrementApiCallCount(sessionId);
  return { allowed: true, remaining: GUEST_API_RATE_LIMIT - session.apiCallCount - 1 };
}
```

### 6. Conversion Tracking

Tracks user interactions for optimization:

```typescript
await trackGuestInteraction(guestSessionId, 'feature_access', {
  feature: 'marketplace',
  component: 'team-switcher',
  timestamp: Date.now()
});
```

### 7. Auto Cleanup

Scheduled cleanup via API endpoint:

```bash
# Call this endpoint with a cron job every hour
curl -X POST /api/cleanup-guest-sessions \
  -H "Authorization: Bearer YOUR_CLEANUP_SECRET"
```

## 🚀 Deployment and Configuration

### 1. Environment Variables

Add to your `.env.local`:

```bash
# Guest session cleanup secret
CLEANUP_SECRET=your-secure-cleanup-secret-here
```

### 2. Cloudflare Cron Job

Set up a cron trigger in `wrangler.toml`:

```toml
[[triggers.crons]]
schedules = ["0 * * * *"]  # Every hour
```

### 3. Security Considerations

- Guest sessions expire after 2 hours
- Rate limiting prevents API abuse
- No sensitive data stored in guest sessions
- IP-based tracking for analytics
- Secure cleanup endpoint with authorization

## 📊 Analytics and Monitoring

Track conversion metrics:

```typescript
const analytics = await getGuestSessionAnalytics(24); // Last 24 hours
console.log({
  totalSessions: analytics.totalSessions,
  activeSessions: analytics.activeSessions,
  conversions: analytics.conversions,
  conversionRate: analytics.conversionRate,
  avgSessionDuration: analytics.avgSessionDuration,
  topFeatures: analytics.topFeatures
});
```

## 🔄 Conversion Flow

1. **Guest arrives** → Automatic guest session created
2. **Guest explores** → Interactions tracked, banner shows status
3. **Feature restriction** → Upgrade prompts shown for premium features
4. **Conversion** → Guest signs up, session data transferred and cleaned up

## 🛠️ Customization Options

### Adjust Session Duration
```typescript
// In src/utils/guest-session.ts
export const GUEST_SESSION_DURATION = ms("4h"); // Extend to 4 hours
```

### Modify Feature Access
```typescript
// In src/types.ts
export const DEFAULT_GUEST_FEATURES: GuestFeatureAccess = {
  canViewDashboard: true,
  canAccessMarketplace: true,
  canViewComponents: true,
  canMakePurchases: true,        // ✅ Allow guest purchases
  canCreateTeams: false,
  canAccessBilling: false,
  apiCallLimit: 100,             // Increase limit
  sessionDurationHours: 4,       // Extend duration
};
```

### Customize UI Messages
Update the `GuestFeatureGate` component to show different messages for different features.

## 🧪 Testing

Test the implementation:

1. Visit `/dashboard` without being logged in
2. Verify guest session banner appears
3. Try restricted features (teams, billing)
4. Check API rate limiting
5. Verify session expires after 2 hours
6. Test conversion tracking

## 🎯 Best Practices

1. **Progressive Disclosure** - Show more advanced features as users engage
2. **Contextual Prompts** - Display upgrade prompts when users try restricted features
3. **Clear Value Proposition** - Make it obvious what full registration provides
4. **Smooth Conversion** - Minimize friction in the sign-up process
5. **Regular Cleanup** - Run cleanup jobs to prevent database bloat

## 🔍 Troubleshooting

### Guest Session Not Created
- Check if cookies are enabled
- Verify database connection
- Check for JavaScript errors in browser console

### Rate Limiting Issues
- Verify API call counting logic
- Check rate limit configuration
- Monitor for unusual traffic patterns

### Conversion Tracking Problems
- Ensure interaction tracking is called
- Check database foreign key constraints
- Verify analytics query performance

This implementation provides a complete "try-before-login" experience that balances user experience with security and conversion optimization. 