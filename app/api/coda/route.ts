import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

const { CodaClient } = require('../../../lib/coda-client');
const { CodaAIAnalyzer } = require('../../../lib/coda-ai-analyzer');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, meetingId, docId, tableId, customMapping, aiAnalysisConfig, formData } = body;

    console.log('🔗 Coda API request:', { action, meetingId, docId, tableId });

    if (!docId || !tableId) {
      return NextResponse.json(
        { error: 'Coda document ID and table ID are required' },
        { status: 400 }
      );
    }

    const codaClient = new CodaClient();

    switch (action) {
      case 'create_research_initiative':
        return await createResearchInitiative(codaClient, meetingId, docId, tableId, customMapping, aiAnalysisConfig, formData);
      
      case 'test_connection':
        return await testCodaConnection(codaClient, docId, tableId);
      
      case 'get_table_columns':
        return await getTableColumns(codaClient, docId, tableId);
      
      case 'analyze_with_ai':
        return await analyzeWithAI(meetingId, aiAnalysisConfig);
      
      case 'get_initiatives':
        return await getInitiatives(codaClient, docId, tableId);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Coda API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createResearchInitiative(codaClient: any, meetingId: string, docId: string, tableId: string, customMapping?: any, aiAnalysisConfig?: any, formData?: any) {
  try {
    if (!meetingId) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      );
    }

    // Get meeting data from database
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    const { data: meeting, error: fetchError } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Meeting not found' },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // Transform meeting data for Coda
    const meetingData = {
      id: meeting.id,
      title: meeting.title,
      customer: extractCustomerName(meeting),
      date: meeting.date,
      duration: meeting.duration_minutes ? `${meeting.duration_minutes} min` : 'Unknown',
      priority: calculatePriority(meeting),
      sentiment: inferSentiment(meeting),
      summary: meeting.raw_transcript ? 
        meeting.raw_transcript.substring(0, 500) + '...' : 
        'No transcript available',
      keyTopics: extractKeyTopics(meeting),
      actionItems: extractActionItems(meeting),
      attendees: meeting.participants || []
    };

    console.log('📋 Creating research initiative for meeting:', meetingData.title);

    // Perform AI analysis if configured
    let aiAnalysis = null;
    if (aiAnalysisConfig && meeting.raw_transcript) {
      console.log('🧠 Running AI analysis for Coda integration...');
      aiAnalysis = await performAIAnalysis(meeting.raw_transcript, aiAnalysisConfig);
    }

    // Create research initiative in Coda with form data, AI analysis, or default mapping
    let mappingData = null;
    if (formData) {
      mappingData = { formData, aiAnalysis };
    } else if (customMapping) {
      mappingData = { ...customMapping, aiAnalysis };
    }
    const result = await codaClient.createResearchInitiative(meetingData, docId, tableId, mappingData);

    console.log('✅ Research initiative created:', result.requestId);

    // Update meeting record to indicate Coda integration
    try {
      await supabase
        .from('meetings')
        .update({ 
          coda_integrated: true,
          coda_request_id: result.requestId,
          updated_at: new Date().toISOString()
        })
        .eq('id', meetingId);
      console.log('✅ Meeting updated with Coda integration status');
    } catch (updateError) {
      console.warn('⚠️ Failed to update meeting Coda status:', updateError);
      // Don't fail the entire request if this update fails
    }

    return NextResponse.json({
      success: true,
      message: 'Research initiative created in Coda',
      requestId: result.requestId,
      codaUrl: result.codaUrl,
      meetingTitle: meetingData.title,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to create research initiative:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create research initiative' },
      { status: 500 }
    );
  }
}

async function testCodaConnection(codaClient: any, docId: string, tableId: string) {
  try {
    const result = await codaClient.testConnection(docId, tableId);
    
    return NextResponse.json({
      success: true,
      message: 'Coda connection successful',
      table: result.table,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Coda connection test failed:', error);
    return NextResponse.json(
      { error: error.message || 'Connection test failed' },
      { status: 500 }
    );
  }
}

async function getTableColumns(codaClient: any, docId: string, tableId: string) {
  try {
    const result = await codaClient.getTableColumns(docId, tableId);
    
    return NextResponse.json({
      success: true,
      columns: result.columns,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to get table columns:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get table columns' },
      { status: 500 }
    );
  }
}

// Helper functions
function extractCustomerName(meeting: any): string {
  // Try to extract customer name from meeting title
  const title = meeting.title || '';
  
  const patterns = [
    /(?:demo|call|meeting)[-–\s]+([^-–]+)/i,
    /([^-–]+?)[-–\s]+(?:demo|call|meeting|qbr)/i,
    /with\s+([^-–(]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return 'Unknown Customer';
}

function calculatePriority(meeting: any): 'high' | 'medium' | 'low' {
  // Simple priority calculation based on meeting data
  const hasTranscript = meeting.raw_transcript && meeting.raw_transcript.length > 100;
  const recentMeeting = new Date(meeting.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const longMeeting = meeting.duration_minutes && meeting.duration_minutes > 45;
  
  if (hasTranscript && recentMeeting && longMeeting) {
    return 'high';
  } else if (hasTranscript && (recentMeeting || longMeeting)) {
    return 'medium';
  } else {
    return 'low';
  }
}

function inferSentiment(meeting: any): 'positive' | 'neutral' | 'negative' {
  if (!meeting.raw_transcript) return 'neutral';
  
  const text = meeting.raw_transcript.toLowerCase();
  const positive = ['great', 'excellent', 'love', 'perfect', 'amazing', 'satisfied', 'happy'];
  const negative = ['issue', 'problem', 'frustrated', 'disappointed', 'concerned', 'difficult'];
  
  const positiveCount = positive.filter(word => text.includes(word)).length;
  const negativeCount = negative.filter(word => text.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function extractKeyTopics(meeting: any): string[] {
  if (!meeting.raw_transcript) return [];
  
  const keywords = ['analytics', 'dashboard', 'integration', 'deployment', 'pricing', 'performance', 'feature', 'customization', 'security', 'training'];
  const text = meeting.raw_transcript.toLowerCase();
  
  return keywords.filter(keyword => text.includes(keyword)).slice(0, 5);
}

function extractActionItems(meeting: any): string[] {
  if (!meeting.raw_transcript) return [];
  
  const actionPatterns = [
    /(?:will|need to|should|must)\s+([^.!?]{10,80})/gi,
    /(?:follow up|schedule|send|provide)\s+([^.!?]{10,80})/gi
  ];
  
  const items: string[] = [];
  actionPatterns.forEach(pattern => {
    const matches = [...meeting.raw_transcript.matchAll(pattern)];
    matches.forEach(match => {
      if (match[1] && items.length < 5) {
        items.push(match[1].trim());
      }
    });
  });
  
  return items;
}

async function performAIAnalysis(transcript: string, aiAnalysisConfig: any) {
  try {
    const aiAnalyzer = new (require('../../../lib/coda-ai-analyzer').CodaAIAnalyzer)();
    
    let analysis: any = {};
    
    // Perform JTBD analysis if configured
    if (aiAnalysisConfig.jtbdQuestions && aiAnalysisConfig.jtbdQuestions.length > 0) {
      const jtbdResults = await aiAnalyzer.analyzeForJTBD(transcript, aiAnalysisConfig.jtbdQuestions);
      analysis.jtbd = jtbdResults;
    }
    
    // Perform custom research analysis if configured
    if (aiAnalysisConfig.customQuestions && aiAnalysisConfig.customQuestions.length > 0) {
      const customResults = await aiAnalyzer.analyzeForCustomResearch(transcript, aiAnalysisConfig.customQuestions);
      analysis.customResearch = customResults;
    }
    
    // Extract specific data points if configured
    if (aiAnalysisConfig.extractionRules) {
      const extractedData = await aiAnalyzer.extractSpecificData(transcript, aiAnalysisConfig.extractionRules);
      analysis.extractedData = extractedData;
    }
    
    return analysis;
    
  } catch (error) {
    console.error('❌ AI analysis failed:', error);
    return { error: error.message };
  }
}

async function getInitiatives(codaClient: any, docId: string, tableId: string) {
  try {
    // Use the actual initiatives table ID provided by the user
    const initiativesTableId = 'grid-Wh9_yGcu3U';
    
    console.log('📋 Fetching initiatives from Coda table:', initiativesTableId);
    
    // Fetch rows from the initiatives table with specific column filtering
    // Based on your Coda table structure, we need to target the first column which contains initiative names
    const result = await codaClient.getTableRows(docId, initiativesTableId, []);
    
    if (!result.success) {
      throw new Error('Failed to fetch initiatives from Coda');
    }
    
    console.log('🔍 Raw Coda API response:', JSON.stringify(result, null, 2));
    console.log('🔍 Number of rows returned:', result.rows?.length || 0);
    
    if (result.rows && result.rows.length > 0) {
      console.log('🔍 First row structure:', JSON.stringify(result.rows[0], null, 2));
    }
    
    // Extract initiative names from the rows - improved approach
    const initiatives = result.rows
      .map((row: any, index: number) => {
        console.log(`🔍 Processing row ${index}:`, JSON.stringify(row, null, 2));
        
        let initiativeName = null;
        
        if (row.values) {
          // Get all available column keys and log them
          const availableKeys = Object.keys(row.values);
          console.log('🔍 Available column keys:', availableKeys);
          
          // Try to find the initiative name using various approaches
          // Method 1: Look for columns with common initiative-related names
          const initiativeKeys = [
            'Initiative', 'initiative', 'Name', 'name', 'Title', 'title',
            'Initiative Name', 'Initiative Title', 'Project', 'project'
          ];
          
          for (const key of initiativeKeys) {
            if (row.values[key]) {
              const value = row.values[key];
              initiativeName = value.displayValue || value.value || (typeof value === 'string' ? value : null);
              if (initiativeName && initiativeName.trim()) {
                console.log(`🔍 Found initiative using key "${key}":`, initiativeName);
                break;
              }
            }
          }
          
          // Method 2: If no standard key found, take the first non-empty column value
          if (!initiativeName) {
            for (const key of availableKeys) {
              const value = row.values[key];
              if (value) {
                const extractedValue = value.displayValue || value.value || (typeof value === 'string' ? value : null);
                if (extractedValue && typeof extractedValue === 'string' && extractedValue.trim() && extractedValue.length > 0) {
                  initiativeName = extractedValue.trim();
                  console.log(`🔍 Using first available column "${key}":`, initiativeName);
                  break;
                }
              }
            }
          }
          
          // Method 3: Check row.name if available (Coda sometimes puts the first column value here)
          if (!initiativeName && row.name) {
            initiativeName = row.name;
            console.log('🔍 Using row.name:', initiativeName);
          }
        }
        
        console.log(`🔍 Final extracted initiative name for row ${index}:`, initiativeName);
        
        if (initiativeName && typeof initiativeName === 'string' && initiativeName.trim() && initiativeName !== 'undefined') {
          return {
            id: row.id || `initiative-${index}`,
            name: initiativeName.trim()
          };
        }
        return null;
      })
      .filter((initiative: any) => initiative !== null) // Remove null entries
      .filter((initiative: any) => initiative.name && initiative.name.length > 0) // Ensure name exists
      .slice(0, 50); // Limit to 50 initiatives
    
    console.log(`✅ Found ${initiatives.length} initiatives from Coda:`, initiatives);

    // If no initiatives found, add some debug info and fallback
    if (initiatives.length === 0) {
      console.log('⚠️ No initiatives extracted from Coda data');
      if (result.rows && result.rows.length > 0) {
        console.log('🔍 Debug: Raw first row data:', JSON.stringify(result.rows[0], null, 2));
      }
    }

    return NextResponse.json({
      success: true,
      initiatives: initiatives,
      timestamp: new Date().toISOString(),
      debug: {
        totalRows: result.rows?.length || 0,
        extractedInitiatives: initiatives.length
      }
    });

  } catch (error) {
    console.error('❌ Failed to get initiatives:', error);
    
    // Enhanced fallback with more realistic data
    console.log('🔄 Falling back to mock initiatives data');
    const fallbackInitiatives = [
      { id: 'fallback-1', name: 'Customer Interview Program' },
      { id: 'fallback-2', name: 'Product Market Fit Research' },
      { id: 'fallback-3', name: 'User Experience Study' },
      { id: 'fallback-4', name: 'Competitive Analysis' },
      { id: 'fallback-5', name: 'Feature Discovery Sessions' },
      { id: 'fallback-6', name: 'Customer Journey Mapping' },
      { id: 'fallback-7', name: 'Voice of Customer Initiative' }
    ];
    
    return NextResponse.json({
      success: true,
      initiatives: fallbackInitiatives,
      timestamp: new Date().toISOString(),
      note: 'Using fallback data due to API error',
      error: error.message
    });
  }
}

async function analyzeWithAI(meetingId: string, aiAnalysisConfig: any) {
  try {
    if (!meetingId || !aiAnalysisConfig) {
      return NextResponse.json(
        { error: 'Meeting ID and AI analysis config are required' },
        { status: 400 }
      );
    }

    // Get meeting data from database
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    const { data: meeting, error: fetchError } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Meeting not found' },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    if (!meeting.raw_transcript) {
      return NextResponse.json(
        { error: 'No transcript available for AI analysis' },
        { status: 400 }
      );
    }

    console.log('🧠 Running AI analysis for meeting:', meeting.title);
    
    const analysis = await performAIAnalysis(meeting.raw_transcript, aiAnalysisConfig);

    return NextResponse.json({
      success: true,
      analysis,
      meetingTitle: meeting.title,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to analyze with AI:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze with AI' },
      { status: 500 }
    );
  }
}