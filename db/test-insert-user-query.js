// https://node-postgres.com/features/queries

const { pool } = require('./index');

async function insertUserProfile() {
  const query = `
    INSERT INTO user_profile (email, name, address)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = ['john.doe@example.com', 'John Doe', '123 Main St, Springfield'];

  try {
    const res = await pool.query(query, values);
    console.log('Inserted user:', res.rows[0]);
  } catch (err) {
    console.error('Error inserting user:', err);
  }
}

insertUserProfile();