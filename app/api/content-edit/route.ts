import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ContentEditRequest {
  action: 'get' | 'update' | 'save_draft' | 'get_versions' | 'restore_version';
  contentId: string;
  editorId?: string;
  updates?: {
    content_title?: string;
    generated_content?: string;
    tldr_summary?: string;
    tldr_bullet_points?: string[];
    content_type?: string;
    target_audience?: string;
  };
  versionId?: string;
  saveAsDraft?: boolean;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('content_id');
    const action = searchParams.get('action') || 'get';

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'get':
        return await getContentForEditing(contentId);
      case 'get_versions':
        return await getContentVersions(contentId);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Content edit GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: ContentEditRequest = await request.json();
    const { action, contentId, editorId, updates, versionId, saveAsDraft } = body;

    switch (action) {
      case 'update':
        return await updateContent(contentId, updates, editorId, saveAsDraft);
      case 'save_draft':
        return await saveDraftVersion(contentId, updates, editorId);
      case 'restore_version':
        return await restoreVersion(contentId, versionId!, editorId);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Content edit POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getContentForEditing(contentId: string) {
  try {
    const { data, error } = await supabase
      .from('generated_content')
      .select(`
        id,
        content_title,
        generated_content,
        content_type,
        target_audience,
        status,
        approval_status,
        quality_score,
        created_at,
        updated_at,
        tldr_summary,
        tldr_bullet_points,
        tldr_key_takeaways,
        tldr_action_items,
        last_edited_by,
        last_edited_at,
        version_number,
        is_draft
      `)
      .eq('id', contentId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      content: data,
      editable: data.approval_status !== 'approved' || data.status !== 'published',
      metadata: {
        last_edited: data.last_edited_at,
        version: data.version_number || 1,
        is_draft: data.is_draft || false
      }
    });

  } catch (error) {
    console.error('Error getting content for editing:', error);
    return NextResponse.json(
      { error: 'Failed to get content' },
      { status: 500 }
    );
  }
}

async function updateContent(contentId: string, updates: any, editorId?: string, saveAsDraft?: boolean) {
  try {
    // First, get the current content to create a backup
    const { data: currentContent } = await supabase
      .from('generated_content')
      .select('*')
      .eq('id', contentId)
      .single();

    if (!currentContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Create a version backup before updating
    await createVersionBackup(currentContent);

    // Prepare update data
    const updateData = {
      ...updates,
      last_edited_by: editorId || 'anonymous',
      last_edited_at: new Date().toISOString(),
      version_number: (currentContent.version_number || 1) + 1,
      is_draft: saveAsDraft || false,
      updated_at: new Date().toISOString()
    };

    // If saving as draft, don't change approval status
    if (saveAsDraft) {
      updateData.status = 'draft';
    } else {
      // If making significant changes, reset approval status
      if (updates.generated_content || updates.content_title) {
        updateData.approval_status = 'pending';
        updateData.status = 'review';
      }
    }

    const { data, error } = await supabase
      .from('generated_content')
      .update(updateData)
      .eq('id', contentId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log the edit action
    await logEditAction(contentId, 'update', editorId, updates);

    return NextResponse.json({
      success: true,
      message: saveAsDraft ? 'Draft saved successfully' : 'Content updated successfully',
      content: data,
      version: data.version_number
    });

  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

async function saveDraftVersion(contentId: string, updates: any, editorId?: string) {
  try {
    // Save updates as draft without changing approval status
    const { data, error } = await supabase
      .from('generated_content')
      .update({
        ...updates,
        is_draft: true,
        last_edited_by: editorId || 'anonymous',
        last_edited_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    await logEditAction(contentId, 'save_draft', editorId, updates);

    return NextResponse.json({
      success: true,
      message: 'Draft saved successfully',
      content: data
    });

  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}

async function getContentVersions(contentId: string) {
  try {
    // Mock version history - in a real implementation, this would query a content_versions table
    const mockVersions = [
      {
        id: 'v1',
        content_id: contentId,
        version_number: 1,
        title: 'Initial AI Generation',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        created_by: 'ai_system',
        changes_summary: 'Initial content generated by AI',
        is_current: false
      },
      {
        id: 'v2',
        content_id: contentId,
        version_number: 2,
        title: 'Editorial Review',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        created_by: 'editor_user',
        changes_summary: 'Updated title and improved introduction',
        is_current: false
      },
      {
        id: 'v3',
        content_id: contentId,
        version_number: 3,
        title: 'Final Version',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        created_by: 'marketing_team',
        changes_summary: 'Added call-to-action and polished content',
        is_current: true
      }
    ];

    return NextResponse.json({
      success: true,
      versions: mockVersions,
      count: mockVersions.length
    });

  } catch (error) {
    console.error('Error getting content versions:', error);
    return NextResponse.json(
      { error: 'Failed to get content versions' },
      { status: 500 }
    );
  }
}

async function restoreVersion(contentId: string, versionId: string, editorId?: string) {
  try {
    // Mock version restoration - in a real implementation, this would restore from content_versions table
    console.log(`Restoring version ${versionId} for content ${contentId} by ${editorId}`);

    return NextResponse.json({
      success: true,
      message: 'Version restored successfully'
    });

  } catch (error) {
    console.error('Error restoring version:', error);
    return NextResponse.json(
      { error: 'Failed to restore version' },
      { status: 500 }
    );
  }
}

async function createVersionBackup(content: any) {
  try {
    // In a real implementation, this would create an entry in a content_versions table
    const versionBackup = {
      content_id: content.id,
      version_number: content.version_number || 1,
      content_title: content.content_title,
      generated_content: content.generated_content,
      tldr_summary: content.tldr_summary,
      tldr_bullet_points: content.tldr_bullet_points,
      created_at: new Date().toISOString(),
      created_by: content.last_edited_by || 'system'
    };

    console.log('Version backup created:', versionBackup);

  } catch (error) {
    console.error('Error creating version backup:', error);
  }
}

async function logEditAction(contentId: string, action: string, editorId?: string, changes?: any) {
  try {
    // In a real implementation, this would log to an edit_history table
    const logEntry = {
      content_id: contentId,
      action,
      editor_id: editorId || 'anonymous',
      changes_made: changes ? Object.keys(changes) : [],
      timestamp: new Date().toISOString()
    };

    console.log('Edit action logged:', logEntry);

  } catch (error) {
    console.error('Error logging edit action:', error);
  }
}