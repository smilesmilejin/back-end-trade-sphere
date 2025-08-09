const { pool } = require('./test-db-setup');

async function getUsers() {
  try {
    const res = await pool.query('SELECT * FROM user_profile');
    return res.rows; 
  } catch (err) {
    console.error('Error querying users:', err);
    throw err;
  }
}

getUsers().then(users => console.log(users));