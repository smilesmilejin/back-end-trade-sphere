var express = require('express');
var router = express.Router();

const { pool } = require('../db/index');
const listingQueries = require('../db/queries/listings');


// GET /search
// GET /listings/search?query=chair
router.get('/', async(req, res)=> {
  const keyword = req.query.query?.trim();

  console.log(keyword);

  if (!keyword) {
    return res.status(400).json({ error: 'Search keyword is required' });
  }

  try {
    const query = listingQueries.GET_LISTINGS_AND_IMAGES_WITH_KEYWORD_SEARCH
    const result = await pool.query(query, [keyword]);
    res.status(200).json(result.rows);

  } catch (err) {
    console.error('Error fetching listings:', err); 
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error' }); 
  }
});

module.exports = router;