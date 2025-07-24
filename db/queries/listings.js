module.exports = {
  GET_ALL_LISTINGS_WITH_IMAGES: `
    SELECT 
    l.*, 
    COALESCE(
    json_agg(i.*) FILTER (WHERE i.image_id IS NOT NULL),
    '[]'
    ) AS images
    FROM listing l
    LEFT JOIN image i ON l.listing_id = i.listing_id
    GROUP BY l.listing_id;
    `,

    // with comment
    // SELECT 
    // l.*,  -- Select all columns from the listing table
    // COALESCE( -- It checks each value in order.Returns the first one that is not NULL.
    // json_agg(i.*) FILTER (WHERE i.image_id IS NOT NULL), -- Aggregate related images into a JSON array, ignoring NULL image rows
    // '[]' -- If no images exist, return an empty array instead of null
    // ) AS images
    // FROM listing l
    // LEFT JOIN image i ON l.listing_id = i.listing_id -- Join images to listings using listing_id; keeps listings even if no images
    // GROUP BY l.listing_id;   -- Required for aggregation; groups results by listing
    // `,

    // Testing wrong query
    //   GET_ALL_LISTINGS_WITH_IMAGES: `
    //     SELECT 
    //     l.*,
    //     COALESCE(
    //     json_agg(i.*) FILTER (WHERE i.image_id IS NOT NULL),
    //     '[]'
    //     ) AS images
    //     FROM listings l
    //     LEFT JOIN image i ON l.listing_id = i.listing_id
    //     GROUP BY l.listing_id;
    //     `,

  GET_LISTING_WITH_IMAGES_BY_ID: `
    SELECT 
    l.*,
    COALESCE(
    json_agg(i.*) FILTER (WHERE i.image_id IS NOT NULL),
    '[]'
    ) AS images
    FROM listing l
    LEFT JOIN image i ON l.listing_id = i.listing_id
    WHERE l.listing_id = $1
    GROUP BY l.listing_id;
    `,

    CREATE_LISTING: `
    INSERT INTO listing (user_id, name, category, description, price, location, contact_information, created_at, updated_at, sold_status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $8)
    RETURNING *;
    `,

    UPDATE_LISTING: `
      UPDATE listing 
      SET 
        name = $1,
        category = $2,
        description = $3,
        price = $4,
        location = $5,
        contact_information = $6,
        updated_at = CURRENT_TIMESTAMP,
        sold_status = $7
      WHERE listing_id = $8 AND user_id = $9
      RETURNING *;
      `,
    
};