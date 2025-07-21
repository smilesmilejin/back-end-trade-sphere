// Use CommonJS syntax everywhere
const { pool, client } = require('./index');

async function test() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Pool connected:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Pool error:', err.message);
  } finally {
    await pool.end();
  }

  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('✅ Client connected:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Client error:', err.message);
  } finally {
    await client.end();
  }
}

test().catch(console.error);