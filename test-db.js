const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:tRrX%23-8k3B7_K9Q@db.evbiikeriwbwjcwmrhou.supabase.co:5432/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => {
    console.log('✅ Connected successfully!');
    return client.query('SELECT NOW()');
  })
  .then(result => {
    console.log('Server time:', result.rows[0]);
    client.end();
  })
  .catch(err => {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  });
