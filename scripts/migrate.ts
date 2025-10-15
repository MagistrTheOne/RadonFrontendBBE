import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from '../src/lib/db/schema';

const connectionString = 'postgresql://neondb_owner:npg_OBRKmo0kDFN1@ep-late-bonus-ad5s2dit-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function runMigration() {
  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client, { schema });

  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations completed successfully!');
  
  await client.end();
}

runMigration().catch(console.error);
