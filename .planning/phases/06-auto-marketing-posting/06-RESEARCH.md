# Phase 6: Auto Marketing & Posting - Research Notes

## Discovery Summary

### External Service Research

#### 1. Property Listing Sites (iProperty, PropertyGuru)
**Finding:** No public API available for posting listings programmatically.

- **iProperty**: Offers iProperty PRO app for agents (iOS/Android), but no public API for third-party integration
- **PropertyGuru**: Has AgentNet portal but limited API access
- **Workaround Options:**
  - Manual posting via agent portals
  - RSS feed sync (if supported)
  - Third-party property management integrations (e.g., PropAgent, AgentBox)

**Decision for MVP:** Focus on social media + WhatsApp for automation, manual for property listing sites.

#### 2. Facebook/Instagram (Meta Graph API)
**Finding:** Instagram Graph API available for posting.

**Requirements:**
- Facebook Business account
- Instagram Business or Creator account (not personal)
- Meta App with permissions: `instagram_basic`, `pages_show_list`, `instagram_content_publish`
- Two-step posting: Create media container → Publish

**Implementation Path:**
- Create `src/services/social-posting-service.ts`
- Store access token in settings (user provides their own)
- Support image posts with property details as caption

#### 3. WhatsApp Broadcast
**Finding:** Twilio WhatsApp API available for bulk messaging.

**Requirements:**
- Twilio account with WhatsApp sandbox
- Business phone number registered
- Pre-approved message templates for broadcasts
- Recipient opt-in required

**Alternative:** Third-party providers like Sanuker, PropStag offer managed WhatsApp blasts (easier setup)

**Implementation Path:**
- Support Twilio integration (MVP)
- Allow users to configure their own Twilio credentials

#### 4. Website Integration
**Finding:** Simple to implement - generate JSON/RSS feed.

**Implementation:**
- `/api/v1/listings/feed` endpoint returning JSON
- RSS format at `/api/v1/listings/rss`
- External websites can poll this for vacancy data

---

## Architecture Patterns Identified

1. **MarketingChannelService** - Abstract service for different channels
2. **ChannelConfig** - User preferences per channel (enabled/disabled)
3. **ListingFeed** - Unified property listing format
4. **PostTrigger** - What causes auto-post (lease expiry, manual trigger)

---

## Recommended Approach for MVP

1. **MKT-01**: Channel configuration UI (Settings page)
2. **MKT-02**: Social media posting (Instagram Graph API)
3. **MKT-03**: WhatsApp broadcast (Twilio API)
4. **MKT-04**: Website integration (JSON/RSS feed endpoint)
5. **MKT-05**: Auto-post trigger on property vacancy
6. **MKT-06**: Manual post trigger per property

**Deferred to v2:** iProperty/PropertyGuru automatic posting (no public API available)

---

## User Setup Required

- Meta Business account + Instagram Business account + App credentials
- Twilio account + WhatsApp-enabled sender
- Optional: External website URL for feed sync