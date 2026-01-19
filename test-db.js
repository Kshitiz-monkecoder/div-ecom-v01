import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const db = createClient({
  url: process.env.DATABASE_URL,      
  authToken: process.env.DATABASE_TOKEN
});

async function testConnection() {
  try {
    const result = await db.execute('SELECT 1 AS connected');
    console.log('✅ Database connection successful!');
    console.log(result.rows); 
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
}

testConnection();
