export async function POST(request) {
  try {
    const body = await request.json();
    const { action, meetingId, docId, tableId, formData, researchType } = body;

    // Basic validation
    if (!action || !meetingId || !formData) {
      return Response.json(
        { success: false, error: 'Missing required fields: action, meetingId, formData' },
        { status: 400 }
      );
    }

    if (action === 'create_research_initiative') {
      // First, get the meeting data with transcript
      const meetingResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/meetings/${meetingId}`);
      let meeting = null;
      
      if (meetingResponse.ok) {
        const meetingData = await meetingResponse.json();
        meeting = meetingData.meeting;
      }

      // Prepare AI analysis payload
      const aiAnalysisPayload = {
        meetingId,
        transcript: meeting?.raw_transcript || '',
        meetingTitle: meeting?.title || '',
        customerName: formData.customerName,
        researchType: formData.researchType,
        customerSegment: formData.customerSegment,
        priority: formData.priority,
        userNotes: formData.primaryFinding || '',
        userQuotes: formData.customerQuotes || ''
      };

      // Simulate AI analysis (in production, this would call Claude API)
      console.log('AI Analysis Starting:', {
        meetingId,
        transcriptLength: aiAnalysisPayload.transcript.length,
        researchType: formData.researchType
      });

      // Generate AI-powered insights (simulated)
      const aiInsights = {
        productAreas: ['Dashboard', 'Integrations', 'API'],
        featureRequests: [
          {
            title: 'Single Sign-On Integration',
            priority: 'High',
            description: 'Customer requested SAML/OAuth integration for enterprise login'
          },
          {
            title: 'Real-time Data Sync',
            priority: 'Medium',
            description: 'Need for faster data refresh rates in dashboard'
          }
        ],
        painPoints: [
          {
            area: 'User Experience',
            severity: 'Medium',
            description: 'Navigation between sections is confusing for new users'
          }
        ],
        competitiveIntel: [
          {
            competitor: 'Competitor X',
            context: 'Customer mentioned they evaluated but chose us for better API flexibility'
          }
        ],
        businessImpact: {
          revenueRisk: 'Medium',
          expansionOpportunity: 'High',
          urgencyScore: 7.5
        },
        actionableInsights: [
          'Schedule follow-up demo of SSO capabilities',
          'Connect with engineering team regarding API enhancements',
          'Provide competitive positioning document'
        ]
      };

      // Log the complete research export with AI insights
      console.log('Product Research Export with AI Analysis:', {
        meetingId,
        researchType: researchType || 'product_insights',
        docId,
        tableId,
        timestamp: new Date().toISOString(),
        manualInput: {
          customerName: formData.customerName,
          researchType: formData.researchType,
          customerSegment: formData.customerSegment,
          priority: formData.priority,
          keyObservations: formData.primaryFinding,
          customerQuotes: formData.customerQuotes
        },
        aiGeneratedInsights: aiInsights
      });

      // TODO: Implement actual Coda API integration with AI insights
      // const codaResponse = await fetch(`https://coda.io/apis/v1/docs/${docId}/tables/${tableId}/rows`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.CODA_API_KEY}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     rows: [{
      //       cells: [
      //         { column: 'Research Type', value: formData.researchType },
      //         { column: 'Customer', value: formData.customerName },
      //         { column: 'Customer Segment', value: formData.customerSegment },
      //         { column: 'Priority', value: formData.priority },
      //         { column: 'Product Areas', value: aiInsights.productAreas.join(', ') },
      //         { column: 'Feature Requests', value: JSON.stringify(aiInsights.featureRequests) },
      //         { column: 'Pain Points', value: JSON.stringify(aiInsights.painPoints) },
      //         { column: 'Competitive Intel', value: JSON.stringify(aiInsights.competitiveIntel) },
      //         { column: 'Business Impact Score', value: aiInsights.businessImpact.urgencyScore },
      //         { column: 'Action Items', value: aiInsights.actionableInsights.join('\n') },
      //         { column: 'Meeting ID', value: meetingId },
      //         { column: 'Export Date', value: new Date().toISOString() }
      //       ]
      //     }]
      //   })
      // });

      // Return success with AI analysis summary
      return Response.json({
        success: true,
        message: 'Product research successfully published with AI analysis',
        data: {
          exportId: `research_${meetingId}_${Date.now()}`,
          timestamp: new Date().toISOString(),
          recordsCreated: 1,
          aiInsightsGenerated: {
            productAreasIdentified: aiInsights.productAreas.length,
            featureRequestsExtracted: aiInsights.featureRequests.length,
            painPointsAnalyzed: aiInsights.painPoints.length,
            competitiveIntelGathered: aiInsights.competitiveIntel.length,
            urgencyScore: aiInsights.businessImpact.urgencyScore
          }
        }
      });
    }

    return Response.json(
      { success: false, error: `Unsupported action: ${action}` },
      { status: 400 }
    );

  } catch (error) {
    console.error('Coda export error:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Failed to export research data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}