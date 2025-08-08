# Grain Webhook Auto-Population Strategy

## Overview

This document outlines the comprehensive strategy for auto-populating meeting data fields from Grain webhook events. The current webhook implementation at `app/api/grain-webhook/route.js` provides a solid foundation but needs enhancements to fully populate all fields displayed in the meetings dashboard.

## Current State Analysis

### Schema Mismatch Issues (RESOLVED)
- ✅ Fixed field name mismatches between expected schema and actual implementation
- ✅ Aligned `full_transcript` → `raw_transcript`
- ✅ Aligned `attendees` → `participants`
- ✅ Created comprehensive sample data for testing

### Current Webhook Coverage

#### Fully Supported Fields
- ✅ `grain_meeting_id` - Unique identifier from Grain
- ✅ `title` - Meeting title extraction
- ✅ `meeting_date` - Start time from webhook
- ✅ `duration_minutes` - Calculated from start/end times
- ✅ `participants` - Comprehensive participant data with scope detection
- ✅ `customer_id` - Smart customer matching and creation
- ✅ `raw_transcript` - Fetched from transcript URLs

#### Partially Supported Fields  
- ⚠️ `recording_url` - Available in webhook but not consistently populated
- ⚠️ `share_url` - Available as grain_share_url but needs proper mapping
- ⚠️ AI analysis fields - Framework exists but needs enhancement

#### Missing/Needs Enhancement
- ❌ Automatic AI Summary generation
- ❌ Intelligence Notes processing from Grain's native analysis
- ❌ Comprehensive insight extraction and database population

## Auto-Population Strategy

### Phase 1: Enhanced Field Mapping (IMMEDIATE)

#### 1.1 Recording URL Population
```javascript
// In handleGrainZapierData() - Line 756-767
.upsert({
  grain_id: enrichedData.grain_meeting_id,
  title: enrichedData.title,
  date: enrichedData.meeting_date,
  duration_minutes: enrichedData.duration_minutes,
  participants: enrichedData.participants,
  raw_transcript: enrichedData.raw_transcript,
  customer_id: enrichedData.customer_id,
  recording_url: enrichedData.recording_url,  // ADD THIS
  share_url: enrichedData.grain_share_url,    // ADD THIS
  created_at: new Date().toISOString()
})
```

#### 1.2 Intelligence Notes Integration
- Current webhook receives `recording_intelligence_notes_(markdown)` from Grain
- Need to process and store this data for display in the dashboard
- Map to existing `meeting_summary` field or create new `intelligence_notes` column

### Phase 2: AI Analysis Enhancement (WEEK 1-2)

#### 2.1 Immediate Analysis Trigger
Current implementation at line 781-789 already triggers AI analysis when:
- Transcript is available (>50 characters)
- Intelligence notes are present from Grain

**Enhancement needed:**
```javascript
// Enhanced trigger conditions in handleGrainZapierData()
if ((enrichedData.raw_transcript && enrichedData.raw_transcript.length > 50) || 
    mappedData.intelligence_notes || 
    mappedData.data_summary) {
  console.log('🤖 Starting AI analysis with rich Grain data...');
  await analyzeMeetingWithAI(savedMeeting, {
    grain_summary: mappedData.data_summary,
    summary_points: mappedData.summary_points,
    intelligence_notes: mappedData.intelligence_notes,
    transcript: enrichedData.raw_transcript
  });
}
```

#### 2.2 AI Summary Generation
Current `analyzeMeetingWithAI()` function needs enhancement to:
- Generate meeting summaries when transcript is available
- Extract and process Grain's native intelligence notes
- Create comprehensive insights data

### Phase 3: Database Population (WEEK 2-3)

#### 3.1 Schema Alignment
The comprehensive schema from `meeting-intelligence-schema.sql` includes:
- `meeting_insights` - For AI-extracted insights
- `meeting_action_items` - For follow-up tasks
- `meeting_feature_requests` - For product requests
- `meeting_competitive_intel` - For competitive mentions
- `meeting_topics` - For key discussion points

#### 3.2 Enhanced saveInsightsToDatabase()
Current function at line 251-277 only logs insights. Enhancement needed:

```javascript
async function saveInsightsToDatabase(meetingId, analysis) {
  try {
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    // Save insights
    if (analysis.insights && analysis.insights.length > 0) {
      const insightPromises = analysis.insights.map(insight => 
        supabase.from('meeting_insights').insert({
          meeting_id: meetingId,
          insight_type: insight.type,
          category: insight.category,
          title: insight.title,
          description: insight.description,
          quote: insight.quote,
          importance_score: insight.importance_score,
          confidence_score: insight.confidence_score,
          priority: insight.priority,
          tags: insight.tags,
          affected_feature: insight.affected_feature,
          ai_model_used: 'claude-3-haiku',
          processing_version: '2.0'
        })
      );
      
      await Promise.all(insightPromises);
      console.log(`✅ Saved ${analysis.insights.length} insights`);
    }

    // Save action items
    if (analysis.action_items && analysis.action_items.length > 0) {
      const actionPromises = analysis.action_items.map(action =>
        supabase.from('meeting_action_items').insert({
          meeting_id: meetingId,
          description: action.description,
          assigned_to: action.assigned_to,
          due_date: action.due_date,
          priority: action.priority,
          category: action.category,
          created_from_ai: true
        })
      );
      
      await Promise.all(actionPromises);
      console.log(`✅ Saved ${analysis.action_items.length} action items`);
    }

    // Save feature requests
    if (analysis.feature_requests && analysis.feature_requests.length > 0) {
      const featurePromises = analysis.feature_requests.map(async feature => {
        // First save the feature request
        const { data: savedFeature } = await supabase
          .from('meeting_feature_requests')
          .insert({
            meeting_id: meetingId,
            feature_title: feature.title,
            feature_description: feature.description,
            business_value: feature.business_value,
            urgency: feature.urgency,
            customer_pain_point: feature.customer_pain_point,
            estimated_impact: feature.estimated_impact,
            customer_priority: feature.urgency
          })
          .select()
          .single();

        // Create JIRA ticket if urgency is high or critical
        if (feature.urgency === 'high' || feature.urgency === 'critical') {
          const jiraTicketKey = await createJiraTicket(feature, meetingId);
          if (jiraTicketKey) {
            await supabase
              .from('meeting_feature_requests')
              .update({ 
                jira_ticket_key: jiraTicketKey,
                created_jira_ticket: true 
              })
              .eq('id', savedFeature.id);
          }
        }
      });
      
      await Promise.all(featurePromises);
      console.log(`✅ Saved ${analysis.feature_requests.length} feature requests`);
    }

    // Save competitive intelligence
    if (analysis.competitive_intelligence && analysis.competitive_intelligence.length > 0) {
      const competitivePromises = analysis.competitive_intelligence.map(comp =>
        supabase.from('meeting_competitive_intel').insert({
          meeting_id: meetingId,
          competitor_name: comp.competitor_name,
          mention_type: comp.mention_type,
          context: comp.context,
          sentiment: comp.sentiment,
          threat_level: comp.threat_level,
          customer_intent: comp.customer_intent,
          quote: comp.quote
        })
      );
      
      await Promise.all(competitivePromises);
      console.log(`✅ Saved ${analysis.competitive_intelligence.length} competitive mentions`);
    }

  } catch (error) {
    console.error('Failed to save insights to database:', error);
    throw error;
  }
}
```

### Phase 4: Grain Intelligence Integration (WEEK 3-4)

#### 4.1 Native Grain Analysis Processing
Grain provides rich intelligence data in the webhook:
- `data_summary` - AI-generated meeting summary
- `summary_points` - Key discussion points
- `intelligence_notes` - Markdown-formatted insights

**Integration approach:**
1. Use Grain's analysis as primary source when available
2. Supplement with our AI analysis for additional insights
3. Merge and deduplicate insights from both sources

#### 4.2 Enhanced Intelligence Processing
```javascript
async function processGrainIntelligence(grainData, meetingId) {
  const processedData = {
    summary: grainData.data_summary,
    insights: [],
    action_items: [],
    topics: []
  };

  // Process intelligence notes markdown
  if (grainData.intelligence_notes) {
    // Extract key takeaways
    const takeaways = extractKeyTakeaways(grainData.intelligence_notes);
    takeaways.forEach(takeaway => {
      processedData.insights.push({
        type: 'key_takeaway',
        title: 'Key Takeaway',
        description: takeaway,
        source: 'grain_intelligence',
        importance_score: 0.8,
        confidence_score: 0.9
      });
    });

    // Extract action items
    const actions = extractActionItems(grainData.intelligence_notes);
    actions.forEach(action => {
      processedData.action_items.push({
        description: action,
        source: 'grain_intelligence',
        priority: 'medium',
        created_from_ai: true
      });
    });
  }

  // Process summary points
  if (grainData.summary_points && Array.isArray(grainData.summary_points)) {
    grainData.summary_points.forEach(point => {
      processedData.topics.push({
        topic: point.topic || point.title || point,
        source: 'grain_summary',
        relevance_score: 0.7
      });
    });
  }

  return processedData;
}
```

## Implementation Timeline

### Week 1: Immediate Enhancements
1. ✅ Fix recording_url and share_url mapping
2. ✅ Enhance AI analysis triggers
3. ✅ Implement comprehensive saveInsightsToDatabase()

### Week 2: Database Integration
1. ✅ Deploy comprehensive schema (meeting_insights, action_items, etc.)
2. ✅ Update all insight saving functions
3. ✅ Test with existing webhook data

### Week 3: Grain Intelligence Integration
1. ✅ Implement Grain intelligence processing
2. ✅ Merge Grain and AI analysis results
3. ✅ Update dashboard to display all data sources

### Week 4: Testing & Optimization
1. ✅ End-to-end testing with real Grain webhooks
2. ✅ Performance optimization
3. ✅ Error handling and fallback mechanisms

## Data Flow Architecture

```
Grain Meeting Event
       ↓
Webhook Received (grain-webhook/route.js)
       ↓
Data Type Detection (Direct vs Zapier)
       ↓
Comprehensive Data Mapping
       ↓
Data Enrichment (Customer matching, etc.)
       ↓
Database Storage (meetings table)
       ↓
AI Analysis Trigger
       ↓
Parallel Processing:
├── Grain Intelligence Processing
└── Custom AI Analysis
       ↓
Insight Merging & Deduplication
       ↓
Comprehensive Database Population:
├── meeting_insights
├── meeting_action_items
├── meeting_feature_requests
├── meeting_competitive_intel
└── meeting_topics
       ↓
Slack Notifications
       ↓
JIRA Ticket Creation (high-priority items)
```

## Success Metrics

### Data Completeness
- **Target**: 95% of meetings have all core fields populated
- **Current**: ~70% (estimated)
- **Key fields**: transcript, summary, insights, action_items

### AI Analysis Coverage
- **Target**: 100% of meetings with transcript get AI analysis within 2 minutes
- **Current**: ~60% (manual testing needed)

### User Experience
- **Target**: Zero empty tabs in meeting dashboard
- **Current**: Intelligence Notes tab often empty

## Risk Mitigation

### 1. Webhook Reliability
- Implement retry mechanisms for failed analyses
- Store raw webhook data for reprocessing
- Add webhook health monitoring

### 2. AI Analysis Failures
- Graceful fallback to basic data extraction
- Store error states for manual review
- Implement analysis retries for transient failures

### 3. Database Performance
- Optimize queries with proper indexing
- Implement batch processing for large datasets
- Monitor database performance impact

## Monitoring & Alerting

### 1. Webhook Processing Metrics
- Success/failure rates by webhook type
- Processing time distribution
- Data completeness scores

### 2. AI Analysis Metrics
- Analysis success rates
- Processing time per meeting
- Insight extraction quality scores

### 3. User Experience Metrics
- Dashboard load times
- Empty data field frequencies
- User engagement with auto-populated content

## Next Steps

1. **Immediate**: Deploy enhanced field mapping changes
2. **Week 1**: Implement comprehensive database population
3. **Week 2**: Integrate Grain intelligence processing
4. **Week 3**: End-to-end testing and optimization
5. **Ongoing**: Monitor metrics and iterate based on user feedback

---

*This strategy ensures that future Grain webhook data will auto-populate all required fields for a complete meeting intelligence experience.*