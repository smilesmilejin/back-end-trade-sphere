const { pool } = require('./index');

async function updateUserTimestamp(userId) {
  const query = `
    UPDATE user_profile
    SET updated_at = current_timestamp
    WHERE user_id = $1
    RETURNING *;
  `;
  const values = [userId];

  try {
    const res = await pool.query(query, values);
    console.log('Updated user:', res.rows[0]);
  } catch (err) {
    console.error('Error updating timestamp:', err);
  }
}

// Example usage
updateUserTimestamp(1); // Replace 1 with the actual user_id