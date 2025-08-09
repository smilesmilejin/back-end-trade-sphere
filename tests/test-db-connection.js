const { pool } = require('./test-db-setup');

async function test() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Pool connected:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Pool error:', err.message);
  } finally {
    await pool.end();
  }
}

test().catch(console.error);