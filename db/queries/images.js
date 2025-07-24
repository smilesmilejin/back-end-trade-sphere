
module.exports = {
  CREATE_LISTING_IMAGE: `
    INSERT INTO image (listing_id, image_url)
    VALUES ($1, $2)
    `,
};