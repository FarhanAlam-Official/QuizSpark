import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

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
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

interface JsonUser {
  id: string
  email: string
  password: string
  role: string
  name?: string
  createdAt?: string
  updatedAt?: string
}

async function migrateUsers() {
  try {
    // Read users from JSON DB
    const dbPath = path.join(process.cwd(), 'db.json')
    const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
    const users: JsonUser[] = dbContent.users || []

    console.log(`Found ${users.length} users to migrate`)

    for (const user of users) {
      try {
        console.log(`\nProcessing user: ${user.email}`)

        // Generate UUID if the ID is not already a UUID
        const userId = user.id.length === 36 ? user.id : uuidv4()

        // Create auth user in Supabase
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: 'Temp@123', // Set a temporary password
          email_confirm: true,
          user_metadata: {
            name: user.name || user.email.split('@')[0],
            role: user.role
          }
        })

        if (authError) {
          if (authError.message.includes('User already registered')) {
            console.log(`User ${user.email} already exists in Supabase, skipping...`)
            continue
          }
          console.error(`Error creating auth user ${user.email}:`, authError)
          continue
        }

        // Insert into public users table manually in case trigger fails
        const { error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            id: authUser?.user.id, // Use the ID from the created auth user
            email: user.email,
            name: user.name || user.email.split('@')[0],
            role: user.role,
            created_at: user.createdAt || new Date().toISOString()
          })
          .select()

        if (insertError) {
          if (insertError.message.includes('duplicate key')) {
            console.log(`User record for ${user.email} already exists in public table`)
          } else {
            console.error(`Error inserting public user record for ${user.email}:`, insertError)
          }
          continue
        }

        console.log(`✓ Successfully migrated user: ${user.email}`)
        console.log('  - Temporary password set to: Temp@123')
        console.log('  - User should reset password on first login')

      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error)
      }
    }

    console.log('\nUser migration completed!')

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
migrateUsers() 