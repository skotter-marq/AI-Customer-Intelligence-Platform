import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }

  try {
    // Get raw meeting data to see actual columns
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json({ error: 'Failed to query meetings', details: error }, { status: 500 });
    }

    // Also try to get table information
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .limit(1);

    return NextResponse.json({
      success: true,
      meetings_sample: meetings?.[0] || 'No meetings found',
      meetings_columns: meetings?.[0] ? Object.keys(meetings[0]) : [],
      customers_sample: customers?.[0] || 'No customers found',
      customers_columns: customers?.[0] ? Object.keys(customers[0]) : [],
      customer_error: customerError
    });

  } catch (error) {
    console.error('Debug schema error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}