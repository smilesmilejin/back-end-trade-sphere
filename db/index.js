require('dotenv').config()
// console.log(process.env)  # this is to test if dotenv is working

// import pg from 'pg'
const pg = require('pg');
const { Pool, Client } = pg

// const connectionString = 'postgres://postgres:postgres@localhost:5432/node_pg'
const connectionString = process.env.DATABASE_URL;
console.log('connection string is: ', connectionString)

 
const pool = new Pool({
  connectionString,
})
 

const client = new Client({
  connectionString,
})

module.exports = { pool, client };