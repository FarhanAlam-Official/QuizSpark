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

// Use service_role key for admin operations like migration
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function clearTable(tableName: string) {
  console.log(`Clearing ${tableName} table...`)
  const { error } = await supabaseAdmin
    .from(tableName)
    .delete()
    .not('id', 'is', null) // Delete all records
  
  if (error) {
    console.error(`Error clearing ${tableName} table:`, error)
    throw error
  }
}

async function migrateData() {
  try {
    // Read the existing db.json file
    const dbPath = path.join(process.cwd(), 'db.json')
    if (!fs.existsSync(dbPath)) {
      throw new Error('db.json file not found. Make sure you have data to migrate.')
    }

    const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
    
    console.log('Starting migration...')
    console.log('Database URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    
    // Clear existing data first
    await clearTable('students')
    await clearTable('questions')
    
    // Migrate students
    if (dbContent.students && dbContent.students.length > 0) {
      console.log(`Migrating ${dbContent.students.length} students...`)
      const studentsToMigrate = dbContent.students.map((student: any) => ({
        // Remove any existing id field
        name: student.name,
        group_name: student.group,
        score: student.score || 0
      }))

      const { error: studentsError } = await supabaseAdmin
        .from('students')
        .insert(studentsToMigrate)
      
      if (studentsError) {
        console.error('Error migrating students:', studentsError)
        throw studentsError
      }
      console.log('✓ Students migrated successfully')
    } else {
      console.log('No students to migrate')
    }

    // Migrate questions
    if (dbContent.questions && dbContent.questions.length > 0) {
      console.log(`Migrating ${dbContent.questions.length} questions...`)
      const questionsToMigrate = dbContent.questions.map((question: any) => ({
        // Remove any existing id field
        question: question.question,
        options: question.options,
        correct_option: question.correctOption,
        topic: question.topic || 'General',
        difficulty: question.difficulty || 'Normal'
      }))

      const { error: questionsError } = await supabaseAdmin
        .from('questions')
        .insert(questionsToMigrate)
      
      if (questionsError) {
        console.error('Error migrating questions:', questionsError)
        throw questionsError
      }
      console.log('✓ Questions migrated successfully')
    } else {
      console.log('No questions to migrate')
    }

    // Create a backup of the JSON file
    const backupPath = path.join(process.cwd(), `db.backup.${Date.now()}.json`)
    fs.copyFileSync(dbPath, backupPath)
    console.log(`✓ Backup created at ${backupPath}`)

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
migrateData() 