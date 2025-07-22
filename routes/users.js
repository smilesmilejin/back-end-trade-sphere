var express = require('express');
var router = express.Router();

const validateModelById = require('./routes-utilities');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


// https://expressjs.com/en/guide/routing.html
// Route parameters
// router.get('/:user_id', async(req, res) => {
//   const user = await validateModelById('user_profile', req.params.user_id);
//   res.status(200).json(user);
// });

router.get('/:id', async (req, res) => {
  try {
    const user = await validateModelById('user_profile', req.params.id);
    res.status(200).json(user);
  } catch (err) {
    // res.status(err.statusCode || 500).json({ error: err.message });
    res.status(err.statusCode).json({ error: err.message });
  }
});


// router.get('/:id', async (req, res) => {
//   try {
//     const user = await validateModel('users', req.params.id);
//     res.json(user);
//   } catch (err) {
//     res.status(err.status || 500).json({ message: err.message });
//   }
// });

module.exports = router;
