const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('ERROR: Please set DATABASE_URL environment variable.');
  console.error('Usage: DATABASE_URL="your_url" node fix-db.cjs');
  process.exit(1);
}

const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    await client.connect();
    console.log('✅ Connected to database.');

    const email = 'amrhomes4845@gmail.com';
    const password = 'admin123';
    const hashed = await bcrypt.hash(password, 12);

    // Check if user exists
    const check = await client.query('SELECT id, email, role FROM "User" WHERE email = $1', [email]);
    
    if (check.rows.length === 0) {
      // Create user
      const id = 'admin-001';
      await client.query(
        'INSERT INTO "User" ("id", "email", "password", "role", "name", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
        [id, email, hashed, 'admin', 'Admin001']
      );
      console.log(`✅ Created user: ${email} (Password: ${password})`);
    } else {
      // Update password and role
      await client.query(
        'UPDATE "User" SET password = $1, role = $2 WHERE email = $3',
        [hashed, 'admin', email]
      );
      console.log(`✅ Updated user: ${email} (Password: ${password})`);
    }

    console.log('🚀 You can now login at: https://sublet-zeta.vercel.app/');
  } catch (err) {
    console.error('❌ Database Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
