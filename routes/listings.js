var express = require('express');
var router = express.Router();

const { pool } = require('../db/index');
const { validateModelById } = require('./routes-utilities'); 
const listingQueries = require('../db/queries/listings');

// GET /listings
router.get('/', async (req, res) => {
  try {
    const query = listingQueries.GET_ALL_LISTINGS_WITH_IMAGES; 
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching listings:', err); 
    res.status(500).json({ error: err.message || 'Internal server error' }); 
  }
});

// GET /listings/<listing_id>
router.get('/:listingId', async(req, res)=> {
  const listingId = req.params.listingId

  try {
    await validateModelById('listing', listingId)

    const query = listingQueries.GET_LISTING_WITH_IMAGES_BY_ID
    const result = await pool.query(query, [listingId]);
    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error('Error fetching listings:', err); 
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error' }); 
  }
});


module.exports = router;