import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Setting up database tables...');
    
    // First, let's try to insert sample data directly
    // This will help us understand the table structure needed
    const sampleCompetitor = {
      name: 'Salesforce',
      industry: 'CRM & Sales', 
      description: 'Leading cloud-based CRM platform',
      website_url: 'https://salesforce.com',
      market_cap: '$200B+',
      employees: '70,000+',
      threat_level: 'high',
      status: 'active',
      confidence_score: 0.95,
      created_by: 'api-setup'
    };

    console.log('📝 Attempting to insert sample competitor...');
    const { data, error } = await supabase
      .from('competitors')
      .insert([sampleCompetitor])
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting competitor:', error);
      
      return NextResponse.json({
        success: false,
        error: error.message,
        message: 'Database tables need to be created manually',
        instructions: [
          '1. Go to your Supabase project dashboard',
          '2. Navigate to SQL Editor', 
          '3. Copy and paste the contents of database/competitors_schema.sql',
          '4. Run the SQL to create the tables',
          '5. Then try this API again'
        ]
      }, { status: 500 });
    }

    console.log('✅ Sample competitor inserted:', data);

    // Now try to fetch to confirm it worked
    const { data: competitors, error: fetchError } = await supabase
      .from('competitors')
      .select('*')
      .limit(5);

    if (fetchError) {
      console.error('❌ Error fetching competitors:', fetchError);
      return NextResponse.json({
        success: false,
        error: fetchError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      competitors: competitors,
      count: competitors?.length || 0
    });

  } catch (error) {
    console.error('❌ Setup error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if tables exist by trying to query them
    const { data: competitors, error } = await supabase
      .from('competitors')
      .select('id, name, status')
      .limit(1);

    if (error) {
      return NextResponse.json({
        tablesExist: false,
        error: error.message,
        message: 'Tables need to be created'
      });
    }

    return NextResponse.json({
      tablesExist: true,
      message: 'Database is ready',
      sampleCount: competitors?.length || 0
    });

  } catch (error) {
    return NextResponse.json({
      tablesExist: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}