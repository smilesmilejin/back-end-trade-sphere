// This file holds reusable test data functions — your equivalent of @pytest.fixture.

// const db = require('../test-db-setup');
const { pool } = require('./test-db-setup');

// Insert a single task
const insertOneUser = async () => {
  await pool.query(`
    INSERT INTO user_profile (email, name, address)
    VALUES ($1, $2, $3)
  `, ['test@example.com', 'lulu', null]);
}

// Return a Supertest client
function getClient(app) {
  const request = require('supertest');
  return request(app);
}

module.exports = {
  insertOneUser,
  getClient,
};