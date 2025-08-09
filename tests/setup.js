// const db = require('../test-db-setup');
// // const { pool } = require('./test-db-setup');

// require('dotenv').config()

// beforeAll(async () => {
//   await db.connect(); // Optional, but good for verifying DB
// });

// afterEach(async () => {
//   await db.clear(); // Clean test data
// });

// afterAll(async () => {
//   await db.close(); // Shut down pool
// });


require('dotenv').config(); // Load .env variables

const pg = require('pg');
const { Pool } = pg
const createApp = require('../app'); // your Express app factory
const supertest = require('supertest');

const pool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL,
  // ssl: { rejectUnauthorized: false }, // if needed
});

let app;
let client;

beforeAll(async () => {
  app = createApp({
    // pass any test-specific config here, if your app supports it
    db: pool,
  });
  client = supertest(app);

  // Prepare DB (create tables etc.)
  // await pool.query('CREATE TABLE ...'); // or run migrations
});

afterAll(async () => {
  await pool.end(); // close DB connection
});

// Helper to clear tables before each test (similar to db.drop_all / db.create_all)
beforeEach(async () => {
//   await pool.query('TRUNCATE TABLE user_profile RESTART IDENTITY CASCADE');
  // truncate other tables as needed

  await pool.query('TRUNCATE TABLE user_profile RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE user_favorite_listing RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE listing RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE image RESTART IDENTITY CASCADE');

});

// Export utilities to be used in tests
module.exports = {
  app,
  client,
  pool,
};