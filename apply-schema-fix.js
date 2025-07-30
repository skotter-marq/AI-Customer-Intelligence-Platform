const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function applySchemaFix() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Read the schema fix SQL
    const schemaSql = fs.readFileSync('./fix-db-schema.sql', 'utf8');
    
    console.log('Applying database schema fixes...');
    console.log('SQL to execute:', schemaSql);
    
    // Execute the schema fix
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: schemaSql });
    
    if (error) {
      console.error('Schema fix failed:', error);
      console.log('Trying alternative approach...');
      
      // Try executing statements one by one
      const statements = schemaSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));
      
      for (const statement of statements) {
        if (statement.toLowerCase().includes('alter table')) {
          console.log('Executing:', statement);
          try {
            const { error: stmtError } = await supabase.rpc('exec_sql', { sql_query: statement });
            if (stmtError) {
              console.warn('Statement failed (may already exist):', stmtError.message);
            } else {
              console.log('✅ Statement executed successfully');
            }
          } catch (e) {
            console.warn('Statement error:', e.message);
          }
        }
      }
    } else {
      console.log('✅ Schema fix applied successfully:', data);
    }
    
    // Test the fix by checking if the column exists
    console.log('Testing schema fix...');
    const { data: testData, error: testError } = await supabase
      .from('generated_content')
      .select('approval_status')
      .limit(1);
    
    if (testError) {
      console.error('Schema test failed:', testError);
    } else {
      console.log('✅ Schema fix verified - approval_status column is accessible');
    }
    
  } catch (error) {
    console.error('Schema fix error:', error.message);
    console.error('Stack:', error.stack);
  }
}

applySchemaFix();