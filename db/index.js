// require('dotenv').config()

// // import pg from 'pg'
// const pg = require('pg');
// const { Pool, Client } = pg

// const connectionString = process.env.DATABASE_URL;


// // Add SSL options
// const sslOptions = {
//   ssl: {
//     require: true,
//     rejectUnauthorized: false, // ⚠️ Accept Render's certs (safe for development)
//   },
// };


// const pool = new Pool({
//   connectionString,
//   ...sslOptions,
// });


// const client = new Client({
//   connectionString,
//   ...sslOptions,
// });

// module.exports = { pool, client };

require('dotenv').config();

const pg = require('pg');
const { Pool, Client } = pg;

const isTest = process.env.NODE_ENV === 'test';

// Select connection string based on environment
const connectionString = isTest
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

// Only use SSL options if NOT testing
const sslOptions = !isTest
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Accept Render's certs (safe for development)
      },
    }
  : {};

// Create pool and client with or without SSL depending on environment
const pool = new Pool({
  connectionString,
  ...sslOptions,
});

const client = new Client({
  connectionString,
  ...sslOptions,
});

console.log('Using database:', connectionString);  // Optional for debug

module.exports = { pool, client };
