import { NextRequest, NextResponse } from 'next/server';

// PUT - Update changelog entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updatedEntry = await request.json();
    
    // In production, this would update the database
    // For now, we'll just return the updated entry to simulate success
    console.log(`Updating changelog entry ${id}:`, updatedEntry);
    
    return NextResponse.json({
      success: true,
      message: 'Changelog entry updated successfully',
      entry: updatedEntry
    });
  } catch (error) {
    console.error('Error updating changelog entry:', error);
    return NextResponse.json(
      { error: 'Failed to update changelog entry' },
      { status: 500 }
    );
  }
}

// DELETE - Delete changelog entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // In production, this would delete from the database
    console.log(`Deleting changelog entry ${id}`);
    
    return NextResponse.json({
      success: true,
      message: 'Changelog entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting changelog entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete changelog entry' },
      { status: 500 }
    );
  }
}