var express = require('express');
var router = express.Router();

// const validateModelById = require('./routes-utilities');
const { pool } = require('../db/index');


// GET /listings
// router.get('/', async (req, res) => {
//   const query = `SELECT * FROM listing`;
//   const result = await pool.query(query);

//   res.status(200).json(result.rows);
// });
router.get('/', async (req, res) => {
  try {
    // const query = `SELECT * FROM listing`;
    // const result = await pool.query(query);
    const getUserListingsAndImagesQuery = `
      SELECT 
        l.*,
        COALESCE(
        json_agg(i.*) FILTER (WHERE i.image_id IS NOT NULL),
        '[]'
      ) AS images
      FROM listing l
      LEFT JOIN image i ON l.listing_id = i.listing_id
      GROUP BY l.listing_id;
    `;
    const result = await pool.query(getUserListingsAndImagesQuery);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching listings:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;