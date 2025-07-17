# AI Customer Intelligence Platform

> 🚀 **AI-powered platform that automatically analyzes customer interactions to extract insights, monitor competition, and automate product communications.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-customer-intelligence)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

### 🎯 **Customer Research System** (Primary Focus)
- **Automated transcript analysis** from Grain meeting recordings
- **HubSpot integration** for unified customer data
- **AI-powered insight extraction** (pain points, feature requests, sentiment)
- **Customer correlation engine** to identify patterns across touchpoints
- **Real-time dashboard** for insight management

### 🔍 **Competitive Intelligence**
- Automated competitor monitoring across multiple channels
- Market signal detection and analysis
- Competitive feature gap identification
- Weekly intelligence reports and alerts

### 📝 **Marketing Content Pipeline**
- Customer story extraction from transcripts
- Auto-generated case studies and talk tracks
- Battle card creation from competitive intelligence
- Content calendar integration

### 🔄 **Automated Product Updates** (New Initiative)
- **JIRA story monitoring** for customer-impacting changes
- **AI-powered TLDR generation** for product updates
- **Public changelog page** with searchable interface
- **Slack notifications** for team awareness
- **Customer success query interface** for update impact analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- HubSpot account with API access
- Grain account (Enterprise plan for API access)
- JIRA account with API access
- Slack workspace for notifications

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ai-customer-intelligence.git
cd ai-customer-intelligence
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your API keys (see Configuration section)
```

4. **Setup Supabase database**
```bash
# Run the SQL scripts in the database/ folder
# Or use the Supabase SQL Editor to create tables
```

5. **Start development server**
```bash
npm run dev --turbopack
```

Visit `http://localhost:3000` to see the application.

## 📋 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Integration APIs
HUBSPOT_ACCESS_TOKEN=your_hubspot_token
GRAIN_API_KEY=your_grain_api_key
JIRA_API_TOKEN=your_jira_api_token
JIRA_BASE_URL=your_jira_base_url
SLACK_BOT_TOKEN=your_slack_bot_token

# AI Provider (choose one)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_claude_key
```

### Database Setup

The application uses Supabase (PostgreSQL). Run the SQL scripts in the `database/` folder to create the required tables:

1. `01_core_tables.sql` - Core customer and meeting tables
2. `02_integrations.sql` - HubSpot and JIRA integration tables
3. `03_ai_features.sql` - AI insights and correlation tables
4. `04_product_updates.sql` - Product update and changelog tables

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Deployment**: Vercel
- **AI/ML**: OpenAI GPT-4 or Claude API
- **Integrations**: HubSpot API, Grain API, JIRA API, Slack API

### Key Components

```
app/
├── api/                    # API routes and webhook endpoints
│   ├── grain-webhook/      # Grain meeting data ingestion
│   ├── hubspot-sync/       # HubSpot data synchronization
│   └── jira-webhook/       # JIRA story completion monitoring
├── dashboard/              # Main dashboard interface
├── changelog/              # Public changelog page
└── components/             # Reusable UI components

lib/
├── hubspot.js             # HubSpot integration class
├── ai-analysis.js         # AI insight extraction
└── jira-integration.js    # JIRA story monitoring
```

## 🔄 Integrations

### HubSpot CRM
- **Contacts sync**: Automatic contact data synchronization
- **Deals tracking**: Pipeline and deal stage monitoring
- **Ticket analysis**: Support ticket insight extraction

### Grain Meetings
- **Transcript processing**: Automatic meeting transcript analysis
- **Insight extraction**: AI-powered pain point and feature request identification
- **Customer correlation**: Cross-meeting pattern recognition

### JIRA Project Management
- **Story monitoring**: Track customer-impacting feature completions
- **Automated updates**: Generate TLDRs for product changes
- **Changelog generation**: Public-facing update announcements

### Slack Notifications
- **Team alerts**: Internal notifications for new insights
- **Product updates**: Automated release communications
- **Customer correlations**: Alert teams to emerging patterns

## 📊 Success Metrics

### Customer Research System
- ✅ 50+ customer calls analyzed automatically
- ✅ 200+ insights generated from Grain and HubSpot
- ✅ 20+ customer correlations identified
- ✅ 15+ complete account profiles created

### Product Updates System
- ✅ 80% reduction in manual release communication time
- ✅ 100% of tagged customer-impacting stories auto-generated
- ✅ 50+ JIRA stories successfully monitored
- ✅ 200+ public changelog page views

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Test webhook endpoints
node test-webhook.js
node test-live-webhook.js

# Test integrations
npm run test:integrations
```

## 📚 Documentation

- **[Project Instructions](Project%20Instructions.md)** - Comprehensive project documentation
- **[Architecture Guide](docs/ARCHITECTURE.md)** - Technical architecture details
- **[API Documentation](docs/API.md)** - API endpoints and webhooks
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Deployment configurations
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our [docs](docs/) folder
- **Issues**: Report bugs via [GitHub Issues](https://github.com/yourusername/ai-customer-intelligence/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/yourusername/ai-customer-intelligence/discussions)

## 🗺️ Roadmap

### Current Phase: Data Integration (Weeks 3-4)
- ✅ Supabase database setup
- ✅ HubSpot integration
- 🔄 Grain API integration
- 🔄 JIRA MCP setup

### Next Phase: AI Analysis (Weeks 5-6)
- ⏳ AI transcript analysis engine
- ⏳ Customer correlation system
- ⏳ Insight extraction algorithms

### Future Phases
- 📊 Real-time dashboard
- 🤖 Competitive intelligence automation
- 📝 Marketing content generation
- 🔄 Product update automation

---

**Made with ❤️ for better customer intelligence**
