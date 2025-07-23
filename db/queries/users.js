

module.exports = {
  GET_ALL_USERS: `SELECT * FROM user_profile`,
  // test sql error handling
  //  GET_ALL_USERS: `SELECT * FROM non_exist_table`, 
  CREATE_USER: `
    INSERT INTO user_profile (email, name, address, created_at, updated_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *;
    `,

   UPDATE_USER: `
      UPDATE user_profile
      SET
        email = $1,
        name = $2,
        address = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $4
      RETURNING *;
    `,

};