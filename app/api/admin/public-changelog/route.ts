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

export async function GET(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    // Get all changelog entries
    const { data: entries, error } = await supabase
      .from('generated_content')
      .select('*')
      .eq('content_type', 'changelog_entry')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching changelog entries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch entries' },
        { status: 500 }
      );
    }

    // Calculate stats
    const stats = {
      total_entries: entries.length,
      public_entries: entries.filter(e => e.is_public).length,
      visible_entries: entries.filter(e => e.is_public && e.public_changelog_visible).length,
      pending_entries: entries.filter(e => e.status === 'draft').length,
      published_entries: entries.filter(e => e.status === 'published').length,
    };

    return NextResponse.json({
      success: true,
      entries: entries || [],
      stats
    });

  } catch (error) {
    console.error('Admin public changelog GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { action, entryId, updates } = body;

    if (action === 'update' && entryId && updates) {
      // Update the entry
      const { data, error } = await supabase
        .from('generated_content')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId)
        .select()
        .single();

      if (error) {
        console.error('Error updating entry:', error);
        return NextResponse.json(
          { error: 'Failed to update entry' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        entry: data,
        message: 'Entry updated successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Admin public changelog POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}