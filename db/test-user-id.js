const { pool } = require('./index');


async function getUsersId(modelName, modelId) {
  try {
    const query = `SELECT * FROM ${modelName} WHERE user_id = ${modelId}`
    const res = await pool.query(query);
    return res.rows; 
  } catch (err) {
    console.error('Error querying users:', err);
    throw err;
  }
}

getUsersId('user_profile', 1).then(users => console.log(users));

