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
    const query = `SELECT * FROM listing`;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching listings:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;