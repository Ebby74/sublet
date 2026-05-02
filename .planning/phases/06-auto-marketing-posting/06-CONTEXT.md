# Phase 6: Auto Marketing & Posting - Context

## Phase Goal
Automatically market vacant properties to multiple channels when properties become vacant.

## Features Requested
1. **Property Listing Sites**: Auto-post vacant rooms to iProperty, PropertyGuru
2. **Social Media**: Auto-post to Facebook, Instagram
3. **WhatsApp Broadcast**: Send to interested tenants
4. **Website Integration**: Sync to personal rental website
5. **Channel Configuration**: Enable/disable specific channels per user

## Requirements to Define (MKT-01 to MKT-0X)

Based on user request, the following requirements are anticipated:

- **MKT-01**: Channel configuration (enable/disable channels)
- **MKT-02**: Property listing site integration (iProperty, PropertyGuru)
- **MKT-03**: Social media posting (Facebook, Instagram)
- **MKT-04**: WhatsApp broadcast capability
- **MKT-05**: Website integration / feed sync
- **MKT-06**: Vacancy trigger automation

## Technical Considerations

### Property Listing Sites
- iProperty and PropertyGuru have APIs for listing management
- Need API credentials per user
- Listing format: property details, photos, pricing, availability

### Social Media
- Facebook/Instagram use Meta Graph API
- Requires Facebook Business account
- Instagram Basic Display API for posting

### WhatsApp
- Twilio WhatsApp API or Meta Business API
- Message templates required for business messages
- Opt-in required from recipients

### Website Integration
- RSS feed or JSON API for external sync
- Export listings as JSON/CSV
- Webhook support for real-time updates

## User Perspective
- User marks property as "vacant" or system auto-detects vacancy
- System automatically posts to enabled channels
- User can configure which channels per property
- Dashboard shows posting status

## Dependencies
- Phase 2 (Property Management) - for property data
- Phase 4 (Notifications) - for tenant contact information

## Discovery Level
- **Level 2: Standard Research** - Need to verify API availability and requirements for:
  - iProperty/PropertyGuru API access
  - Meta Graph API for Facebook/Instagram
  - Twilio/Meta WhatsApp integration
  - Website sync format options