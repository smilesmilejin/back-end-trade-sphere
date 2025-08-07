module.exports = {
  GET_ALL_USERS: `SELECT * FROM user_profile`,

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

    // Fetch a user by email (for login or lookups)
  GET_USER_BY_EMAIL: `
    SELECT * FROM user_profile
    WHERE email = $1;
  `,


  GET_LISTINGS_WITH_IMAGES_BY_USER_ID: `
    SELECT 
      l.*,
      COALESCE(
      json_agg(i.*) FILTER (WHERE i.image_id IS NOT NULL),
      '[]'
    ) AS images
    FROM listing l
    LEFT JOIN image i ON l.listing_id = i.listing_id
    WHERE l.user_id = $1
    GROUP BY l.listing_id;
  `,
};