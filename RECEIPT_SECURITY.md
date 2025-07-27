# Receipt Security Implementation Guide

## 🔒 Security Measures

### API Key Protection

**Environment Variables Required:**
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...  # Use sk_live_... for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Use pk_live_... for production
```

**Best Practices:**
- ✅ Never expose secret keys in client-side code
- ✅ Use different keys for test/live environments
- ✅ Rotate keys regularly (quarterly recommended)
- ✅ Monitor Stripe dashboard for unusual API activity

### Data Privacy & Masking

**Implemented Protections:**
```typescript
// Email masking example: user@example.com → us****@example.com
billingDetails.email = maskEmail(originalEmail);

// Card number already masked by Stripe: •••• 4242
// Only last 4 digits are ever exposed
```

**Data Minimization:**
- ✅ Only store `paymentIntentId`, not full payment details
- ✅ Retrieve receipt data on-demand from Stripe
- ✅ No sensitive payment data cached locally
- ✅ Receipt URLs are time-limited by Stripe

### Authorization & Access Control

**Multi-Layer Verification:**
1. **Session Validation:** User must be authenticated
2. **Ownership Verification:** Transaction must belong to user
3. **Transaction Status:** Only successful payments have receipts
4. **Payment Intent Validation:** Format and ID verification

```typescript
// Authorization flow example:
const session = await requireVerifiedEmail();
const userTransaction = transactions.find(t => 
  t.paymentIntentId === paymentIntentId && 
  t.userId === session.user.id
);
```

### Rate Limiting

**Per-User Limits:**
- 📊 10 receipt requests per minute per user
- ⏱️ 60-second sliding window
- 🚫 Automatic blocking for abuse
- 📈 Remaining requests tracking

**Implementation:**
```typescript
if (!ReceiptRateLimit.canMakeRequest(userId)) {
  throw new Error("Too many receipt requests. Please try again later.");
}
```

### Input Validation

**Payment Intent ID Validation:**
```typescript
// Stripe PaymentIntent IDs follow specific format
const isValid = /^pi_[a-zA-Z0-9_]+$/.test(paymentIntentId);
```

**URL Sanitization:**
```typescript
// Only allow Stripe receipt URLs
const allowedHosts = ['stripe.com', 'stripe-images.com'];
const isValidReceiptUrl = allowedHosts.some(host => 
  parsedUrl.hostname.includes(host)
);
```

### Error Handling Security

**Information Disclosure Prevention:**
- ❌ Never expose internal error details to users
- ✅ Log detailed errors server-side only
- ✅ Return generic error messages to client
- ✅ Distinguish between retryable and permanent errors

**Error Response Examples:**
```typescript
// ❌ BAD - Exposes internal details
throw new Error(`Database connection failed: ${dbError.message}`);

// ✅ GOOD - Generic user message
throw new Error("Unable to process receipt request. Please try again.");
```

## 🛡️ Security Checklist

### Production Deployment
- [ ] Use live Stripe API keys
- [ ] Enable Stripe webhook signature verification
- [ ] Configure proper CORS headers
- [ ] Set up API monitoring and alerting
- [ ] Implement request logging for audit trails

### Cloudflare Security Features
- [ ] Enable Bot Management
- [ ] Configure Rate Limiting rules
- [ ] Set up WAF custom rules for API endpoints
- [ ] Enable DDoS protection
- [ ] Configure IP Access Rules if needed

### Monitoring & Alerts
- [ ] Set up alerts for failed authentication attempts
- [ ] Monitor unusual API usage patterns
- [ ] Track receipt request volumes
- [ ] Alert on Stripe API errors

### Data Compliance
- [ ] Ensure GDPR compliance for EU users
- [ ] Implement data retention policies
- [ ] Document data processing activities
- [ ] Provide user data export capabilities

## 🚨 Incident Response

### If API Keys Are Compromised
1. **Immediate Actions:**
   - Revoke compromised keys in Stripe dashboard
   - Generate new API keys
   - Update environment variables
   - Deploy with new keys

2. **Investigation:**
   - Review Stripe API logs for unusual activity
   - Check application logs for unauthorized access
   - Audit recent transactions

3. **Communication:**
   - Notify affected users if necessary
   - Document incident for compliance
   - Update security procedures

### If Rate Limiting Is Bypassed
1. **Detection:**
   - Monitor for unusual request patterns
   - Check for distributed attacks
   - Review user behavior analytics

2. **Mitigation:**
   - Temporarily lower rate limits
   - Block suspicious IP addresses
   - Implement additional validation

## 📋 Testing Security

### Automated Tests
```typescript
// Test authorization
test('should reject receipt access for unauthorized user', async () => {
  const result = await getReceiptInfo('pi_test_123');
  expect(result).toThrow('Unauthorized');
});

// Test rate limiting
test('should enforce rate limits', async () => {
  // Make 11 requests rapidly
  for (let i = 0; i < 11; i++) {
    if (i < 10) {
      expect(() => getReceiptInfo('pi_test_123')).not.toThrow();
    } else {
      expect(() => getReceiptInfo('pi_test_123')).toThrow('Too many requests');
    }
  }
});
```

### Manual Security Testing
- [ ] Test with invalid payment intent IDs
- [ ] Attempt to access other users' receipts
- [ ] Test rate limiting with rapid requests
- [ ] Verify error messages don't leak information
- [ ] Test with malformed request data

This security implementation provides enterprise-grade protection while maintaining a smooth user experience for legitimate receipt access requests. 