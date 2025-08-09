require('dotenv').config()

// import pg from 'pg'
const pg = require('pg');
const { Pool} = pg

const connectionString =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;  // or your production/dev DB URL

// const connectionString = process.env.TEST_DATABASE_URL;
console.log('Test DB URL:', process.env.TEST_DATABASE_URL);


// Add SSL options
// const sslOptions = {
//   ssl: {
//     require: true,
//     rejectUnauthorized: false, // ⚠️ Accept Render's certs (safe for development)
//   },
// };


const pool = new Pool({
  connectionString,
  // ...sslOptions,
});

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