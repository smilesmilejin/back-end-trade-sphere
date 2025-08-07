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

  // GET_LISTINGS_WITH_IMAGES_BY_USER_ID
  // use LEFT JOIN: All listings for user 1 will be returned, regardless of whether they have images.
  // json_agg(i.*) AS images
  // l.listing_id is the primary key, so PostgreSQL guarantees all other l.* columns are functionally dependent on it.
  // That's why it doesn’t require you to list every column in the GROUP BY clause — this is not standard SQL but PostgreSQL-specific.
  
  // Good Practice (optional but safer/future-proof):
  // If you ever migrate to another SQL system (e.g., MySQL or SQL Server), or want stricter SQL compliance, consider being explicit:
      // const getUserListingsAndImagesQuery = `
      // SELECT 
      // l.listing_id,
      // l.user_id,
      // l.name,
      // l.category,
      // l.description,
      // l.price,
      // l.location,
      // l.contact_information,
      // l.created_at,
      // l.updated_at,
      // l.sold_status,
      // COALESCE(json_agg(i.*) FILTER (WHERE i.image_id IS NOT NULL), '[]') AS images
      // FROM listing l
      // LEFT JOIN image i ON l.listing_id = i.listing_id
      // WHERE l.user_id = $1
      // GROUP BY 
      //   l.listing_id,
      //   l.user_id,
      //   l.name,
      //   l.category,
      //   l.description,
      //   l.price,
      //   l.location,
      //   l.contact_information,
      //   l.created_at,
      //   l.updated_at,
      // l.sold_status;
      // `;
};