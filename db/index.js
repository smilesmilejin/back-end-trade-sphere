require('dotenv').config()

// import pg from 'pg'
const pg = require('pg');
const { Pool, Client } = pg

const connectionString = process.env.DATABASE_URL;


// Add SSL options
const sslOptions = {
  ssl: {
    require: true,
    rejectUnauthorized: false, // ⚠️ Accept Render's certs (safe for development)
  },
};


const pool = new Pool({
  connectionString,
  ...sslOptions,
});


const client = new Client({
  connectionString,
  ...sslOptions,
});

module.exports = { pool, client };