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

async function resetDatabase() {
  try {
    console.log('Starting database reset process...');

    // Read the SQL files
    const cleanupPath = path.join(process.cwd(), 'scripts', 'clean-schema.sql');
    const schemaPath = path.join(process.cwd(), 'scripts', 'schema.sql');
    
    const cleanupSQL = fs.readFileSync(cleanupPath, 'utf-8');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    // Split into individual statements
    const cleanupStatements = cleanupSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const schemaStatements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Execute cleanup statements
    console.log('\nCleaning up existing database objects...');
    for (const statement of cleanupStatements) {
      console.log('\nExecuting cleanup SQL:');
      console.log(statement);
      
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql_query: statement
      });

      if (error) {
        console.log('Note: ', error.message);
      } else {
        console.log('✓ Success');
      }
    }

    // Execute schema statements
    console.log('\nCreating new database schema...');
    for (const statement of schemaStatements) {
      console.log('\nExecuting schema SQL:');
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

    console.log('\nDatabase reset completed successfully!');

  } catch (error) {
    console.error('Failed to reset database:', error);
    process.exit(1);
  }
}

// Run the database reset
resetDatabase(); 