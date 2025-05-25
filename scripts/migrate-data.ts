import fs from 'fs';
import path from 'path';

interface Record {
  id: string;
  user_id?: string;
  created_at?: string;
  [key: string]: any;
}

async function migrateData() {
  try {
    // Read the existing db.json file
    const dbPath = path.join(process.cwd(), 'db.json');
    if (!fs.existsSync(dbPath)) {
      throw new Error('db.json file not found');
    }

    const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const timestamp = new Date().toISOString();

    // Get the first user's ID to assign to existing records
    const firstUser = dbContent.users?.[0];
    if (!firstUser) {
      throw new Error('No users found in database');
    }

    // Update each collection
    ['students', 'questions', 'tasks'].forEach(collection => {
      if (dbContent[collection]) {
        dbContent[collection] = dbContent[collection].map((record: Record) => ({
          ...record,
          user_id: record.user_id || firstUser.id,
          created_at: record.created_at || timestamp
        }));
      }
    });

    // Create a backup of the original file
    const backupPath = path.join(process.cwd(), `db.backup.${Date.now()}.json`);
    fs.copyFileSync(dbPath, backupPath);
    console.log(`✓ Created backup at ${backupPath}`);

    // Write the updated data back to db.json
    fs.writeFileSync(dbPath, JSON.stringify(dbContent, null, 2));
    console.log('✓ Successfully migrated data');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateData(); 