import { NextRequest, NextResponse } from 'next/server';

// PATCH - Update visibility status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { is_public } = await request.json();
    
    // In production, this would update the database
    console.log(`Updating visibility for changelog entry ${id}:`, { is_public });
    
    return NextResponse.json({
      success: true,
      message: 'Visibility updated successfully',
      is_public
    });
  } catch (error) {
    console.error('Error updating visibility:', error);
    return NextResponse.json(
      { error: 'Failed to update visibility' },
      { status: 500 }
    );
  }
}