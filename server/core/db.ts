import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../../shared/schema";

neonConfig.webSocketConstructor = ws;

let db: any;
let pool: any;

if (process.env.DATABASE_URL) {
  neonConfig.webSocketConstructor = ws;
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // Development mode without database - use mock
  console.log("⚠️  DATABASE_URL not set. Running in development mode without database.");
  db = null;
  pool = null;
}

export { db, pool };
