module.exports = {
  GET_USER_FAVORITE_LISTINGS_WITH_IMAGES:`
      SELECT 
      l.*, 
      COALESCE(
        json_agg(i.*) FILTER (WHERE i.image_id IS NOT NULL),
        '[]'
      ) AS images
    FROM user_favorite_listing u
    JOIN listing l ON l.listing_id = u.listing_id
    LEFT JOIN image i ON l.listing_id = i.listing_id
    WHERE u.user_id = $1
    GROUP BY l.listing_id;
  `,

  CREATE_USER_FAVORITE_LISTING: `
    INSERT INTO user_favorite_listing (user_id, listing_id, created_at)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    RETURNING *;
  `,

  DELETE_USER_FAVORITE_LISTING: `
    DELETE FROM user_favorite_listing
    WHERE user_id = $1 AND listing_id = $2
    RETURNING *;
  `,

};