module.exports = {
  GET_USER_FAVORITE_LISTINGS: `
    SELECT 
      u.user_id, 
      l.*
    FROM user_favorite_listing u
    JOIN listing l ON l.listing_id = u.listing_id
    WHERE u.user_id = $1;
  `,
};