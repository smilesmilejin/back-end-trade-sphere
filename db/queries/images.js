
module.exports = {
  CREATE_LISTING_IMAGE: `
    INSERT INTO image (listing_id, image_url)
    VALUES ($1, $2)
    `,
  
  DELETE_IMAGES_BY_LISTING_ID: `
    DELETE FROM image
    WHERE listing_id = $1;
    `,
};