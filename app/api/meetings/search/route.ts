import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase-client';

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');
    const searchType = searchParams.get('type') || 'all'; // 'transcript', 'topics', 'insights', 'all'
    const customer = searchParams.get('customer');
    const dateRange = searchParams.get('dateRange');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const searchResults = await performSearch(query, {
      limit,
      searchType,
      customer,
      dateRange
    });

    return NextResponse.json({
      success: true,
      query,
      results: searchResults,
      total_results: searchResults.length,
      search_metadata: {
        search_type: searchType,
        customer_filter: customer,
        date_filter: dateRange,
        query_length: query.length
      }
    });

  } catch (error) {
    console.error('Meeting search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

async function performSearch(query: string, options: any) {
  const { limit, searchType, customer, dateRange } = options;
  const searchTerm = `%${query.toLowerCase()}%`;
  
  let results: any[] = [];

  // Search in meeting transcripts
  if (searchType === 'all' || searchType === 'transcript') {
    const transcriptResults = await searchTranscripts(searchTerm, { customer, dateRange, limit });
    results.push(...transcriptResults.map(r => ({ ...r, search_type: 'transcript' })));
  }

  // Search in meeting topics
  if (searchType === 'all' || searchType === 'topics') {
    const topicResults = await searchTopics(searchTerm, { customer, dateRange, limit });
    results.push(...topicResults.map(r => ({ ...r, search_type: 'topic' })));
  }

  // Search in meeting insights
  if (searchType === 'all' || searchType === 'insights') {
    const insightResults = await searchInsights(searchTerm, { customer, dateRange, limit });
    results.push(...insightResults.map(r => ({ ...r, search_type: 'insight' })));
  }

  // Search in action items
  if (searchType === 'all' || searchType === 'actions') {
    const actionResults = await searchActionItems(searchTerm, { customer, dateRange, limit });
    results.push(...actionResults.map(r => ({ ...r, search_type: 'action_item' })));
  }

  // Sort by relevance score (if available) and meeting date
  results.sort((a, b) => {
    if (a.relevance_score && b.relevance_score) {
      return b.relevance_score - a.relevance_score;
    }
    return new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime();
  });

  return results.slice(0, limit);
}

async function searchTranscripts(searchTerm: string, filters: any) {
  let query = supabase
    .from('meetings')
    .select(`
      id,
      title,
      customer_name,
      meeting_date,
      duration_minutes,
      full_transcript,
      meeting_summary,
      sentiment_label,
      grain_share_url,
      recording_url
    `)
    .not('full_transcript', 'is', null)
    .ilike('full_transcript', searchTerm);

  // Apply filters
  if (filters.customer) {
    query = query.ilike('customer_name', `%${filters.customer}%`);
  }

  if (filters.dateRange) {
    const startDate = getDateFromRange(filters.dateRange);
    query = query.gte('meeting_date', startDate.toISOString());
  }

  query = query.order('meeting_date', { ascending: false }).limit(filters.limit || 10);

  const { data: meetings, error } = await query;

  if (error) {
    console.error('Transcript search error:', error);
    return [];
  }

  return (meetings || []).map(meeting => ({
    meeting_id: meeting.id,
    meeting_title: meeting.title,
    customer_name: meeting.customer_name,
    meeting_date: meeting.meeting_date,
    duration_minutes: meeting.duration_minutes,
    sentiment: meeting.sentiment_label,
    excerpt: extractTranscriptExcerpt(meeting.full_transcript, searchTerm.replace(/%/g, '')),
    summary: meeting.meeting_summary,
    recording_url: meeting.recording_url,
    grain_share_url: meeting.grain_share_url,
    relevance_score: calculateTranscriptRelevance(meeting.full_transcript, searchTerm)
  }));
}

async function searchTopics(searchTerm: string, filters: any) {
  let query = supabase
    .from('meeting_topics')
    .select(`
      *,
      meetings (
        id,
        title,
        customer_name,
        meeting_date,
        recording_url,
        grain_share_url
      )
    `)
    .or(`topic.ilike.${searchTerm},keywords.cs.{${searchTerm.replace(/%/g, '')}}`);

  if (filters.customer) {
    query = query.filter('meetings.customer_name', 'ilike', `%${filters.customer}%`);
  }

  if (filters.dateRange) {
    const startDate = getDateFromRange(filters.dateRange);
    query = query.filter('meetings.meeting_date', 'gte', startDate.toISOString());
  }

  query = query.order('relevance_score', { ascending: false }).limit(filters.limit || 10);

  const { data: topics, error } = await query;

  if (error) {
    console.error('Topic search error:', error);
    return [];
  }

  return (topics || []).map(topic => ({
    meeting_id: topic.meetings.id,
    meeting_title: topic.meetings.title,
    customer_name: topic.meetings.customer_name,
    meeting_date: topic.meetings.meeting_date,
    topic_name: topic.topic,
    topic_category: topic.topic_category,
    keywords: topic.keywords,
    sentiment_score: topic.sentiment_score,
    recording_url: topic.meetings.recording_url,
    grain_share_url: topic.meetings.grain_share_url,
    relevance_score: topic.relevance_score
  }));
}

async function searchInsights(searchTerm: string, filters: any) {
  let query = supabase
    .from('meeting_insights')
    .select(`
      *,
      meetings (
        id,
        title,
        customer_name,
        meeting_date,
        recording_url,
        grain_share_url
      )
    `)
    .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},quote.ilike.${searchTerm}`);

  if (filters.customer) {
    query = query.filter('meetings.customer_name', 'ilike', `%${filters.customer}%`);
  }

  if (filters.dateRange) {
    const startDate = getDateFromRange(filters.dateRange);
    query = query.filter('meetings.meeting_date', 'gte', startDate.toISOString());
  }

  query = query.order('importance_score', { ascending: false }).limit(filters.limit || 10);

  const { data: insights, error } = await query;

  if (error) {
    console.error('Insight search error:', error);
    return [];
  }

  return (insights || []).map(insight => ({
    meeting_id: insight.meetings.id,
    meeting_title: insight.meetings.title,
    customer_name: insight.meetings.customer_name,
    meeting_date: insight.meetings.meeting_date,
    insight_title: insight.title,
    insight_description: insight.description,
    insight_type: insight.insight_type,
    category: insight.category,
    priority: insight.priority,
    quote: insight.quote,
    importance_score: insight.importance_score,
    recording_url: insight.meetings.recording_url,
    grain_share_url: insight.meetings.grain_share_url,
    relevance_score: insight.importance_score
  }));
}

async function searchActionItems(searchTerm: string, filters: any) {
  let query = supabase
    .from('meeting_action_items')
    .select(`
      *,
      meetings (
        id,
        title,
        customer_name,
        meeting_date,
        recording_url,
        grain_share_url
      )
    `)
    .ilike('description', searchTerm);

  if (filters.customer) {
    query = query.filter('meetings.customer_name', 'ilike', `%${filters.customer}%`);
  }

  if (filters.dateRange) {
    const startDate = getDateFromRange(filters.dateRange);
    query = query.filter('meetings.meeting_date', 'gte', startDate.toISOString());
  }

  query = query.order('created_at', { ascending: false }).limit(filters.limit || 10);

  const { data: actionItems, error } = await query;

  if (error) {
    console.error('Action item search error:', error);
    return [];
  }

  return (actionItems || []).map(item => ({
    meeting_id: item.meetings.id,
    meeting_title: item.meetings.title,
    customer_name: item.meetings.customer_name,
    meeting_date: item.meetings.meeting_date,
    action_description: item.description,
    priority: item.priority,
    status: item.status,
    assigned_to: item.assigned_to,
    due_date: item.due_date,
    recording_url: item.meetings.recording_url,
    grain_share_url: item.meetings.grain_share_url,
    relevance_score: calculateActionRelevance(item.description, searchTerm)
  }));
}

function extractTranscriptExcerpt(transcript: string, searchTerm: string): string {
  if (!transcript) return '';
  
  const searchIndex = transcript.toLowerCase().indexOf(searchTerm.toLowerCase());
  if (searchIndex === -1) return transcript.substring(0, 200) + '...';
  
  const start = Math.max(0, searchIndex - 100);
  const end = Math.min(transcript.length, searchIndex + searchTerm.length + 100);
  
  let excerpt = transcript.substring(start, end);
  
  // Add ellipsis if we truncated
  if (start > 0) excerpt = '...' + excerpt;
  if (end < transcript.length) excerpt = excerpt + '...';
  
  // Highlight the search term (will be handled by frontend)
  return excerpt;
}

function calculateTranscriptRelevance(transcript: string, searchTerm: string): number {
  if (!transcript) return 0;
  
  const cleanSearchTerm = searchTerm.replace(/%/g, '').toLowerCase();
  const cleanTranscript = transcript.toLowerCase();
  
  // Count occurrences
  const matches = (cleanTranscript.match(new RegExp(cleanSearchTerm, 'g')) || []).length;
  
  // Calculate relevance based on frequency and transcript length
  const relevance = (matches / (transcript.length / 1000)) * 100;
  
  return Math.min(1, Math.max(0, relevance));
}

function calculateActionRelevance(description: string, searchTerm: string): number {
  if (!description) return 0;
  
  const cleanSearchTerm = searchTerm.replace(/%/g, '').toLowerCase();
  const cleanDescription = description.toLowerCase();
  
  // Exact match gets highest score
  if (cleanDescription.includes(cleanSearchTerm)) {
    return 1;
  }
  
  // Partial word matches
  const words = cleanSearchTerm.split(' ');
  let matchedWords = 0;
  
  words.forEach(word => {
    if (cleanDescription.includes(word)) {
      matchedWords++;
    }
  });
  
  return matchedWords / words.length;
}

function getDateFromRange(range: string): Date {
  const now = new Date();
  
  switch (range) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '3months':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'advanced_search':
        return await performAdvancedSearch(params);
      case 'save_search':
        return await saveUserSearch(params);
      case 'get_search_suggestions':
        return await getSearchSuggestions(params.query);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Meeting search POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function performAdvancedSearch(params: any) {
  // Advanced search with boolean operators, date ranges, etc.
  const { query, filters, operators } = params;
  
  // This would implement more sophisticated search logic
  // For now, delegate to the basic search
  const searchResults = await performSearch(query, {
    limit: filters.limit || 50,
    searchType: filters.type || 'all',
    customer: filters.customer,
    dateRange: filters.dateRange
  });

  return NextResponse.json({
    success: true,
    query,
    results: searchResults,
    search_type: 'advanced'
  });
}

async function saveUserSearch(params: any) {
  // Save frequently used searches for quick access
  const { query, filters, user_id } = params;
  
  // In a real implementation, this would save to a user_saved_searches table
  console.log('Saving search:', { query, filters, user_id });
  
  return NextResponse.json({
    success: true,
    message: 'Search saved successfully'
  });
}

async function getSearchSuggestions(query: string) {
  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // Get popular topics as suggestions
    const { data: topics, error } = await supabase
      .from('meeting_topics')
      .select('topic, topic_category')
      .ilike('topic', `%${query}%`)
      .order('relevance_score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Suggestion error:', error);
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = (topics || []).map(topic => ({
      text: topic.topic,
      category: topic.topic_category,
      type: 'topic'
    }));

    return NextResponse.json({
      success: true,
      suggestions
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}