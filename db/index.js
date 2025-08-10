require('dotenv').config()

// import pg from 'pg'
const pg = require('pg');
const { Pool, Client } = pg

const connectionString = process.env.DATABASE_URL;

const isTest = process.env.NODE_ENV === 'test';

// // Add SSL options
// const sslOptions = {
//   ssl: {
//     require: true,
//     rejectUnauthorized: false, // ⚠️ Accept Render's certs (safe for development)
//   },
// };


// Only use SSL options if NOT testing
const sslOptions = !isTest
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Accept Render's certs (safe for development)
      },
    }
  : {};

const pool = new Pool({
  connectionString,
  ...sslOptions,
});


const client = new Client({
  connectionString,
  ...sslOptions,
});

console.log('Using database:', connectionString);  // for debug

module.exports = { pool, client };