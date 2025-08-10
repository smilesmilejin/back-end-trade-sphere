const { pool } = require('../db/index'); 

// Optional sanity check
const connect = async () => {
  const client = await pool.connect();
  client.release(); // Release client back to pool
};

// Clear tables — adjust based on your schema
const clear = async () => {
  await pool.query('TRUNCATE TABLE user_profile RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE user_favorite_listing RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE listing RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE image RESTART IDENTITY CASCADE');

};

// Close the pool
const close = async () => {
  await pool.end();
};


module.exports = {
  pool,
  connect,
  clear,
  close,
};