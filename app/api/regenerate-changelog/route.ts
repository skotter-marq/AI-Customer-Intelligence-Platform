import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Handle missing environment variables during build
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

const supabase = createSupabaseClient();

export async function POST(request: Request) {
  try {
    // Handle missing Supabase client during build
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const { entryId, relatedStories } = await request.json();

    if (!entryId) {
      return NextResponse.json(
        { success: false, error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    if (!relatedStories || relatedStories.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Related stories are required for regeneration' },
        { status: 400 }
      );
    }

    // Get the original entry
    const { data: originalEntry, error: fetchError } = await supabase
      .from('generated_content')
      .select('*')
      .eq('id', entryId)
      .single();

    if (fetchError || !originalEntry) {
      return NextResponse.json(
        { success: false, error: 'Original entry not found' },
        { status: 404 }
      );
    }

    // Fetch related JIRA stories details
    console.log('🔍 Fetching related JIRA stories:', relatedStories);
    const JiraIntegration = require('../../../lib/jira-integration.js');
    const jiraIntegration = new JiraIntegration();
    
    const relatedStoriesDetails = [];
    const failedStories = [];
    
    for (const storyKey of relatedStories) {
      if (storyKey && storyKey.trim()) {
        try {
          // Fetch individual story details from JIRA
          const storyDetails = await fetchJiraStoryDetails(jiraIntegration, storyKey.trim());
          if (storyDetails) {
            relatedStoriesDetails.push(storyDetails);
            console.log(`✅ Fetched details for ${storyKey}`);
          } else {
            failedStories.push(storyKey.trim());
            console.warn(`⚠️ No details returned for ${storyKey}`);
          }
        } catch (error) {
          failedStories.push(storyKey.trim());
          console.warn(`⚠️ Failed to fetch details for ${storyKey}:`, error.message);
        }
      }
    }

    // Check if we have any successful stories to work with
    if (relatedStoriesDetails.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Could not fetch any of the related stories from JIRA`,
          failedStories: failedStories,
          details: `None of the provided stories could be accessed: ${relatedStories.join(', ')}. Please verify the story keys exist and you have permission to view them.`
        },
        { status: 400 }
      );
    }

    // Log partial success if some stories failed
    if (failedStories.length > 0) {
      console.log(`⚠️ Proceeding with ${relatedStoriesDetails.length}/${relatedStories.length} stories. Failed: ${failedStories.join(', ')}`);
    }

    // Generate enhanced changelog content using AI with related stories context
    console.log('🤖 Generating enhanced changelog with related stories context...');
    const AIProvider = require('../../../lib/ai-provider.js');
    const aiProvider = new AIProvider();

    // Prepare the main story data
    const originalSourceData = originalEntry.source_data || {};
    const mainStory = {
      key: originalSourceData.jira_story_key || 'UNKNOWN',
      summary: originalEntry.content_title,
      description: originalEntry.generated_content,
      priority: originalSourceData.priority || 'medium',
      components: originalSourceData.components || [],
      labels: originalSourceData.labels || []
    };

    // Generate enhanced content with related stories context
    const enhancedContent = await aiProvider.generateEnhancedChangelogWithRelatedStories(
      mainStory,
      relatedStoriesDetails
    );

    // Prepare success response with detailed feedback
    const successMessage = failedStories.length > 0 
      ? `Successfully regenerated content with ${relatedStoriesDetails.length} of ${relatedStories.length} related stories. Could not access: ${failedStories.join(', ')}`
      : `Successfully regenerated content with context from ${relatedStoriesDetails.length} related stories`;

    return NextResponse.json({
      success: true,
      enhancedContent: {
        customer_facing_title: enhancedContent.customer_title,
        customer_facing_description: enhancedContent.customer_description,
        highlights: enhancedContent.highlights,
        breaking_changes: enhancedContent.breaking_changes,
        migration_notes: enhancedContent.migration_notes,
        category: enhancedContent.category
      },
      relatedStoriesProcessed: relatedStoriesDetails.length,
      relatedStoriesRequested: relatedStories.length,
      failedStories: failedStories,
      message: successMessage
    });

  } catch (error) {
    console.error('❌ Regeneration error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to regenerate content with related stories' },
      { status: 500 }
    );
  }
}

async function fetchJiraStoryDetails(jiraIntegration: any, storyKey: string) {
  try {
    // Use the existing JIRA integration to fetch story details
    const response = await jiraIntegration.jiraApi.get(`/issue/${storyKey}`, {
      params: {
        fields: 'summary,description,status,priority,components,labels,assignee'
      }
    });

    const issue = response.data;
    return {
      key: issue.key,
      summary: issue.fields.summary,
      description: issue.fields.description || '',
      status: issue.fields.status.name,
      priority: issue.fields.priority ? issue.fields.priority.name : 'Medium',
      components: issue.fields.components?.map((c: any) => c.name) || [],
      labels: issue.fields.labels || [],
      assignee: issue.fields.assignee ? issue.fields.assignee.displayName : null
    };
  } catch (error) {
    // Enhanced error logging with more specific error details
    const errorMessage = error.response?.data?.errorMessages?.[0] || error.message;
    const statusCode = error.response?.status;
    
    if (statusCode === 404) {
      console.error(`❌ JIRA story ${storyKey} not found (404). Story may not exist or access denied.`);
    } else if (statusCode === 403) {
      console.error(`❌ Access denied to JIRA story ${storyKey} (403). Check permissions.`);
    } else {
      console.error(`❌ Failed to fetch JIRA story ${storyKey} (${statusCode}):`, errorMessage);
    }
    
    return null;
  }
}