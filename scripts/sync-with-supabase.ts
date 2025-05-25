import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local')
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local')
}

// Use service_role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

interface Record {
  id: string;
  [key: string]: any;
}

// Helper function to get the last sync timestamp
function getLastSyncTimestamp(): number {
  const syncFile = path.join(process.cwd(), '.last_sync')
  if (fs.existsSync(syncFile)) {
    return parseInt(fs.readFileSync(syncFile, 'utf-8'))
  }
  return 0
}

// Helper function to save the sync timestamp
function saveLastSyncTimestamp(timestamp: number) {
  const syncFile = path.join(process.cwd(), '.last_sync')
  fs.writeFileSync(syncFile, timestamp.toString())
}

// Helper function to get modified records since last sync
function getModifiedRecords(tableName: string, lastSync: number): Record[] {
  const dbPath = path.join(process.cwd(), 'db.json')
  const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
  const records = dbContent[tableName] || []
  
  // Filter records modified after last sync
  return records.filter((record: Record) => {
    const modifiedAt = record.updated_at ? new Date(record.updated_at).getTime() : 0
    return modifiedAt > lastSync
  })
}

// Helper function to compare and update records
async function syncTable(tableName: string, localRecords: Record[]) {
  console.log(`Syncing ${tableName}...`)
  
  for (const localRecord of localRecords) {
    // Check if record exists in Supabase
    const { data: existingRecord } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .eq('id', localRecord.id)
      .single()

    if (existingRecord) {
      // Update existing record
      const { error: updateError } = await supabaseAdmin
        .from(tableName)
        .update(localRecord)
        .eq('id', localRecord.id)

      if (updateError) {
        console.error(`Error updating ${tableName} record:`, updateError)
        continue
      }
      console.log(`✓ Updated ${tableName} record: ${localRecord.id}`)
    } else {
      // Insert new record
      const { error: insertError } = await supabaseAdmin
        .from(tableName)
        .insert([localRecord])

      if (insertError) {
        console.error(`Error inserting ${tableName} record:`, insertError)
        continue
      }
      console.log(`✓ Inserted ${tableName} record: ${localRecord.id}`)
    }
  }
}

async function syncWithSupabase() {
  try {
    const lastSync = getLastSyncTimestamp()
    const currentTimestamp = Date.now()
    console.log(`Last sync: ${new Date(lastSync).toLocaleString()}`)

    // Get modified records for each table
    const tables = ['users', 'students', 'questions', 'tasks', 'quizzes']
    for (const table of tables) {
      const modifiedRecords = getModifiedRecords(table, lastSync)
      if (modifiedRecords.length > 0) {
        console.log(`Found ${modifiedRecords.length} modified records in ${table}`)
        await syncTable(table, modifiedRecords)
      } else {
        console.log(`No changes in ${table}`)
      }
    }

    // Create a backup of the current JSON DB
    const dbPath = path.join(process.cwd(), 'db.json')
    const backupPath = path.join(process.cwd(), `db.backup.${currentTimestamp}.json`)
    fs.copyFileSync(dbPath, backupPath)
    console.log(`✓ Backup created at ${backupPath}`)

    // Update last sync timestamp
    saveLastSyncTimestamp(currentTimestamp)
    console.log('Sync completed successfully!')
  } catch (error) {
    console.error('Sync failed:', error)
    process.exit(1)
  }
}

// Run the sync
syncWithSupabase() 