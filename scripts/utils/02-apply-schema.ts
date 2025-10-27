import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
}

// Use service_role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function applySchema() {
  try {
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'scripts', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Split into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Execute each statement
    for (const statement of statements) {
      console.log('\nExecuting SQL:');
      console.log(statement);
      
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql_query: statement
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log('Object already exists, continuing...');
        } else {
          console.error('Error executing SQL:', error);
        }
      } else {
        console.log('✓ Success');
      }
    }

    console.log('\nSchema applied successfully!');

  } catch (error) {
    console.error('Failed to apply schema:', error);
    process.exit(1);
  }
}

// Run the schema application
applySchema(); 