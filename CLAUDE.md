# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 AI-powered customer intelligence platform that integrates with HubSpot CRM, Supabase database, and JIRA. The application includes webhook endpoints for data ingestion and HubSpot data synchronization capabilities.

**🚨 CRITICAL: Always reference the `Project Instructions.md` file for:**
- Current project status and task breakdown
- Detailed technical requirements for each initiative
- Environment variables and deployment configurations
- Known issues and their solutions
- Success metrics and timeline expectations

**When working on tasks, always update the task status in `Project Instructions.md` to reflect current progress.**

## Quick Start Commands

```bash
# Development
npm run dev --turbopack    # Start dev server (recommended)
npm run build             # Build for production
npm run start            # Start production server
npm run lint             # Check code quality

# Testing
node test-webhook.js      # Test webhook functionality
node test-live-webhook.js # Test live webhook integration
```

## Architecture Documentation

### Core Tech Stack
- **Next.js 15** with App Router + TypeScript
- **React 19** with Tailwind CSS
- **Supabase** (PostgreSQL + Edge Functions)
- **HubSpot API** + **JIRA API** + **Slack API**

### Project Structure
```
app/
├── api/                 # API routes (webhook endpoints)
├── globals.css         # Global styles
├── layout.tsx          # Root layout
└── page.tsx            # Main page
lib/
└── hubspot.js          # HubSpot integration class
webhook-only/           # Separate webhook deployment
pages/                  # Legacy Pages Router (if needed)
```

### Key Integration Points

#### HubSpot Integration (`lib/hubspot.js`)
**HubSpotIntegration class methods:**
- `syncContacts(limit)` - Syncs contacts to Supabase
- `syncDeals(limit)` - Syncs deals to Supabase  
- `testConnection()` - Tests API connectivity

**Usage Pattern:**
```javascript
const hubspot = new HubSpotIntegration();
await hubspot.syncContacts(100);
```

#### Webhook Endpoints
- `app/api/grain-webhook/route.js` - Grain webhook (POST/GET)
- Configured for 30-second timeout in `vercel.json`

### Database Schema (Supabase)
**Core Tables:**
- `customers` - Customer profiles and segmentation
- `meetings` - Grain recordings and transcripts
- `hubspot_contacts` - HubSpot contact sync
- `hubspot_deals` - Deal pipeline data
- `insights` - AI-extracted insights
- `product_updates` - JIRA story updates (NEW)
- `changelog_views` - Public changelog metrics (NEW)

**Full schema details in `Project Instructions.md`**

## Environment Variables

**Required for all deployments:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Integrations
HUBSPOT_ACCESS_TOKEN=
GRAIN_API_KEY=
JIRA_API_TOKEN=        # NEW
JIRA_BASE_URL=         # NEW
SLACK_BOT_TOKEN=       # NEW
```

**⚠️ See `Project Instructions.md` for complete environment variable list and configuration details.**

## Development Patterns

### Code Style
- **CommonJS** for HubSpot integration (`require`/`module.exports`)
- **ES modules** for Next.js components (`import`/`export`)
- **Error handling** with try/catch blocks and proper HTTP status codes
- **Console logging** for debugging and monitoring

### File Organization Rules
- Keep files under 300 lines
- Extract complex logic into separate modules
- Use clear, descriptive function names
- Document complex business logic inline

## Task Management Integration

### Current Phase Status
**Always check `Project Instructions.md` for current status:**

1. **Foundation** (Weeks 1-2) - ✅ COMPLETE
2. **Data Integration** (Weeks 3-4) - 🔄 IN PROGRESS
3. **AI Analysis** (Weeks 5-6) - ⏳ PENDING
4. **User Interface** (Weeks 7-8) - ⏳ PENDING
5. **Product Updates Integration** (Weeks 8-12) - ⏳ PENDING

### Task Update Protocol
**When working on any task:**
1. Check `Project Instructions.md` for specific requirements
2. Update status using: ✅ COMPLETE | 🔄 IN PROGRESS | ⏳ PENDING | 🆕 NEW
3. Document blockers in "Current Technical Issues" section
4. Update success metrics upon completion

### Priority Tasks (Current Focus)
- **T019**: Setup JIRA MCP Integration
- **T025**: AI Content Generation for Updates
- **T027**: Build Public Changelog Interface

## Deployment Configuration

### Vercel Deployment
- **Primary**: Configured with `vercel.json`
- **Webhook-only**: Separate deployment in `webhook-only/`
- **API timeout**: 30 seconds for webhook endpoints

### Known Issues & Solutions
**Check `Project Instructions.md` for current issues and resolutions**

Common patterns:
- Vercel authentication issues → Check Build Logs Protection
- Environment variables → Verify via Vercel CLI
- API timeouts → Use Edge Functions for long-running tasks

## Testing & Debugging

### Available Test Scripts
```bash
# Webhook testing
node test-webhook.js              # Basic webhook test
node test-live-webhook.js         # Live integration test
node test-live-webhook-debug.js   # Debug mode
```

### Debugging Checklist
1. Check environment variables are loaded
2. Verify API endpoints return expected status codes
3. Test database connections and queries
4. Validate webhook payload structure
5. Check Vercel deployment logs

## Integration Workflows

### Data Flow Examples
**Grain → Supabase:**
Grain → Zapier → Webhook → Supabase → AI Analysis → Dashboard

**HubSpot → Correlation:**
HubSpot API → Correlation Engine → Customer Profiles → Follow-up Actions

**JIRA → Changelog (NEW):**
JIRA → Webhook → AI Generator → Approval → Changelog → Slack

**For detailed workflow diagrams, see `Project Instructions.md`**

---

## Additional Documentation Files

This Claude.md file focuses on development guidance. For comprehensive project details:

- **`Project Instructions.md`** - Complete project documentation
- **Database schema** - Available in Supabase SQL Editor
- **API documentation** - See individual route files in `app/api/`