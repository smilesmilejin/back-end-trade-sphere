

module.exports = {
  GET_ALL_USERS: `SELECT * FROM user_profile`,
  GET_USER_BY_ID: `SELECT * FROM user_profile WHERE user_id = $1`,
  CREATE_USER: `
    INSERT INTO user_profile (email, name, address, created_at, updated_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *;
  `,
};