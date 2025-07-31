var express = require('express');
var router = express.Router();

const { pool } = require('../db/index');
const imagesQueries = require('../db/queries/images');
const { validateModelById } = require('./routes-utilities'); 


// DELETE /images/image_id
router.delete('/:imageId', async(req, res)=> {

  const imageId = req.params.imageId;
  try {
    await validateModelById('image', imageId);

    const query = imagesQueries.DELETE_IMAGES_BY_IMAGE_ID
    await pool.query(query, [imageId]);
    res.status(204).send(); // No content

  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error'});
  }
});

module.exports = router;