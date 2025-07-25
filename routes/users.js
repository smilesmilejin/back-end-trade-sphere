var express = require('express');
var router = express.Router();

const { validateModelById, validateModelRequiredFields} = require('./routes-utilities'); 
const { pool } = require('../db/index');
const userQueries = require('../db/queries/users');
const listingQueries = require('../db/queries/listings');
const imageQueries = require('../db/queries/images');
const favoriteQueries = require('../db/queries/favorite-listings');

// Example
/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

// GET /users
// Retrieve all user profiles
router.get('/', async (req, res) => {
  try {
    // const query = `SELECT * FROM user_profile`;
    const query = userQueries.GET_ALL_USERS; // Use the pre-defined SQL query to get all users
    const result = await pool.query(query); // Execute the query to get all users from the user_profile table

    res.status(200).json(result.rows); // Return the array of user records as JSON

  } catch (error) {
    console.error('Error fetching users:', error); // Handle any errors during the query execution
    res.status(500).json({ error: error.message || 'Internal server error' }); // Send back the SQL error message if available, otherwise generic message
  }
});



// POST users
router.post('/', async (req, res) => {

  const requestBody = req.body // this gets the request_body from the user

  // // validate if all required fields in user_profile are included in the req.body
  // const requiredFields = ['email'];

  // const missingFields = requiredFields.filter(field =>
  // requestBody[field] === undefined || requestBody[field] === null
  // );

  // if (missingFields.length > 0) {
  //   return res.status(400).json({
  //     details: `Missing required field(s): ${missingFields.join(', ')}`
  //   });
  // };

  try {
    await validateModelRequiredFields('user_profile', requestBody)

    // const insertQuery = `
    //   INSERT INTO user_profile (email, name, address, created_at, updated_at)
    //   VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    //   RETURNING *;
    // `;

    const insertQuery = userQueries.CREATE_USER;
    const values = [
      requestBody.email,
      requestBody.name || null,
      requestBody.address || null,
    ];

    const result = await pool.query(insertQuery, values);
    const newUser = result.rows[0];

    // console.log(newUser)

    res.status(201).json(newUser);

  } catch (error) {
    console.error('Error creating users:', error); // Handle errors
    res.status(error.statusCode || 500).json({ error: error.message || 'Internal server error'}); // Send back the SQL error message if available, otherwise generic message
  }

});

// https://expressjs.com/en/guide/routing.html
// Route parameters
// GET users/user_id
router.get('/:userId', async (req, res) => {
  try {
    const user = await validateModelById('user_profile', req.params.userId);
    // const user = await validateModelById('invalid_table', req.params.userId); // test invalid table name
    res.status(200).json(user);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error'});
  }
});

// PATCH users/user_id
router.patch('/:userId', async (req, res) => {
  try {
    const requestBody = req.body

    await validateModelById('user_profile', req.params.userId);
    await validateModelRequiredFields('user_profile', requestBody)


    // const UpdateQuery = `
    //   UPDATE user_profile
    //   SET
    //     email = $1,
    //     name = $2,
    //     address = $3,
    //     updated_at = CURRENT_TIMESTAMP
    //   WHERE user_id = $4
    //   RETURNING *;
    // `;

    const UpdateQuery = userQueries.UPDATE_USER
    const values = [
      requestBody.email,
      requestBody.name || null,
      requestBody.address || null,
      req.params.userId,
    ];

    const result = await pool.query(UpdateQuery, values);
    const updatedUser = result.rows[0];

    // console.log(updatedUser)
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error'});
  }
});


// GET users/<user_id>/listings
router.get('/:userId/listings', async (req, res) => {
  const useId = req.params.userId;
  try {
    await validateModelById('user_profile', useId);

    // const getUserListingsAndImagesQuery = `
    //   SELECT 
    //     l.*,
    //     COALESCE(
    //     json_agg(i.*) FILTER (WHERE i.image_id IS NOT NULL),
    //     '[]'
    //   ) AS images
    //   FROM listing l
    //   LEFT JOIN image i ON l.listing_id = i.listing_id
    //   WHERE l.user_id = $1
    //   GROUP BY l.listing_id;
    // `;
  
    // const values = [useId];

    // const result = await pool.query(getUserListingsAndImagesQuery, values)

    const query = userQueries.GET_LISTINGS_WITH_IMAGES_BY_USER_ID
    const values = [useId];
    const result = await pool.query(query, values)

    res.status(200).json(result.rows)
  } catch(err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error'});
  }

});


// POST users/<user_id>/listings
// To ensure that inserting into two tables (listing, image) happens as a single atomic operation — meaning both succeed or neither happens — you need to wrap them in a PostgreSQL transaction.
// Need to add images urls
// Add a litings with both update image table and listing table at the same time
// image might have muptiples
// https://node-postgres.com/features/transactions?utm_source=chatgpt.com
router.post('/:userId/listings', async(req, res) => {
  const userId = req.params.userId;
  const client = await pool.connect() // The client object obtained via const client = await pool.connect(); in node-postgres (pg package) gives you direct access to transaction control methods.

  try {
    await client.query('BEGIN') // ← Start transaction

    await validateModelById('user_profile', userId);

    const requestBody = req.body

    // const insertQuery = `
    // INSERT INTO listing (user_id, name, category, description, price, location, contact_information, created_at, updated_at, sold_status)
    // VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $8)
    // RETURNING *
    // `

    const createListingQuery = listingQueries.CREATE_LISTING

    const values = [
      userId,
      requestBody.name || null, 
      requestBody.category || null, 
      requestBody.description || null,
      requestBody.price || null,
      requestBody.location || null,
      requestBody.contact_information || null,
      requestBody.sold_status || false,
    ]

    // const insertListingresult = await client.query(insertQuery, values)
    const insertListingresult = await client.query(createListingQuery, values)

    // GET listing_id from result
    const curListingId = insertListingresult.rows[0].listing_id

    const images = Array.isArray(requestBody.images) ? requestBody.images : []; //  If requestBody.images is an array (e.g. ["url1", "url2"]), it keeps the array.  If requestBody.images is undefined, null, a string, or any non-array type — it assigns an empty array ([]), preventing crashes like .length of undefined.

    if (images.length > 0) {
      for (let img_url of images) {
        // const insertImageQuery = `
        // INSERT INTO image (listing_id, image_url)
        // VALUES ($1, $2)
        // `

        const insertListingImageQuery = imageQueries.CREATE_LISTING_IMAGE
        const imgValues = [
          curListingId,
          img_url,
        ];

        // await client.query(insertImageQuery, imgValues)
        await client.query(insertListingImageQuery, imgValues)
      }
    }

    await client.query('COMMIT');      // ← Commit if everything is OK

    // const getUserListingsAndImagesQuery = `
    //   SELECT 
    //     l.*,
    //     COALESCE(
    //     json_agg(i.*) FILTER (WHERE i.image_id IS NOT NULL),
    //     '[]'
    //   ) AS images
    //   FROM listing l
    //   LEFT JOIN image i ON l.listing_id = i.listing_id
    //   WHERE l.listing_id = $1
    //   GROUP BY l.listing_id;
    // `;

    // const finalResult = await client.query(getUserListingsAndImagesQuery, [curListingId]);

    const query = listingQueries.GET_LISTING_WITH_IMAGES_BY_ID
    const finalResult = await client.query(query, [curListingId]);

    res.status(201).json(finalResult.rows);

  } catch(err) {
    await client.query('ROLLBACK');  // ← Rollback on failure
    // throw err; 
    console.error('Transaction error:', err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error'}); // Send error response here instead of throwing

  } finally {
    client.release(); // ← Always release the client
  }
})

// PATCH /users/<user_id>/listings/<listing_id>
router.patch('/:userId/listings/:listingId', async(req, res) => {
  const userId = req.params.userId;
  const listingId = req.params.listingId;
  const requestBody = req.body

  const client = await pool.connect() // The client object obtained via const client = await pool.connect(); in node-postgres (pg package) gives you direct access to transaction control methods.

  try {
    await validateModelById('user_profile', userId);
    await validateModelById('listing', listingId);

    await client.query('BEGIN')

    // update listing
    // const updateListingQuery = `
    //   UPDATE listing 
    //   SET 
    //     name = $1,
    //     category = $2,
    //     description = $3,
    //     price = $4,
    //     location = $5,
    //     contact_information = $6,
    //     updated_at = CURRENT_TIMESTAMP,
    //     sold_status = $7
    //   WHERE listing_id = $8 AND user_id = $9
    //   RETURNING *
    //   `
    const updateListingQuery = listingQueries.UPDATE_LISTING;

    const listingValues = [
      requestBody.name || null, 
      requestBody.category || null, 
      requestBody.description || null,
      requestBody.price || null,
      requestBody.location || null,
      requestBody.contact_information || null,
      requestBody.sold_status || false,
      listingId,
      userId
    ]

    const updatedListingresult = await client.query(updateListingQuery, listingValues);
    const updatedListing = updatedListingresult.rows[0];

    // delete all existing images of listing_id
    // const deleteImagesByListingIdQuery = `
    //   DELETE FROM image
    //   WHERE listing_id = $1;
    // `

    const deleteImagesByListingIdQuery = imageQueries.DELETE_IMAGES_BY_LISTING_ID

    // const deletedImages = await client.query(deleteImagesByListingIdQuery, [listingId]);
    await client.query(deleteImagesByListingIdQuery, [listingId]);


    // insert currrent images of listing_id
    const images = Array.isArray(requestBody.images) ? requestBody.images : []; //  If requestBody.images is an array (e.g. ["url1", "url2"]), it keeps the array.  If requestBody.images is undefined, null, a string, or any non-array type — it assigns an empty array ([]), preventing crashes like .length of undefined.

    if (images.length > 0) {
      for (let img_url of images) {
        // const insertImageQuery = `
        // INSERT INTO image (listing_id, image_url)
        // VALUES ($1, $2)
        // `
        const insertImageQuery = imageQueries.CREATE_LISTING_IMAGE

        const imgValues = [
          listingId,
          img_url,
        ];

        await client.query(insertImageQuery, imgValues)
      }

    }

    await client.query('COMMIT')

  // const getUpdatedListingWithImagesQuery = `
  //   SELECT 
  //     l.*,
  //     COALESCE(json_agg(i.*) FILTER (WHERE i.image_id IS NOT NULL), '[]') AS images
  //   FROM listing l
  //   LEFT JOIN image i ON l.listing_id = i.listing_id
  //   WHERE l.listing_id = $1
  //   GROUP BY l.listing_id;
  // `;

  const getUpdatedListingWithImagesQuery = listingQueries.GET_LISTING_WITH_IMAGES_BY_ID
  const finalResult = await client.query(getUpdatedListingWithImagesQuery, [listingId]);

  res.status(200).json(finalResult.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK')
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error'}); // Send error response here instead of throwing
  } finally {
    client.release()
  }

});


// DELETE /users/<user_id>/listings/<listing_id>
router.delete('/:userId/listings/:listingId', async(req, res) => {
  const userId = req.params.userId;
  const listingId = req.params.listingId;

  try {
    // await validateModelById('user_profile', userId);
    await validateModelById('listing', listingId);

    // DELETE listing will also delete images associated with that listing
    // const deleteSpecificListingQuery = `
    //   DELETE FROM listing
    //   WHERE listing_id = $1
    // `

    const deleteSpecificListingQuery = listingQueries.DELETE_LISTING_BY_ID
    await pool.query(deleteSpecificListingQuery, [listingId])

    // res.status(204) /// this does not provide response:
    // User one of the following:
    // res.sendStatus(204);
    // res.status(204).send();

    res.status(204).send(); // No content

  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error'});
  }
  
})

// GET /users/<user_id>/favorites
router.get('/:userId/favorites', async(req, res) => {
  const userId = req.params.userId;

  try {

    await validateModelById('user_profile', userId)

    // const getUsersFavoriteListingsQuery = `
    //   SELECT 
    //     u.user_id, 
    //     l.*
    //   FROM user_favorite_listing u
    //   JOIN listing l ON l.listing_id = u.listing_id
    //   WHERE u.user_id = $1
    // `
    const getUsersFavoriteListingsQuery = favoriteQueries.GET_USER_FAVORITE_LISTINGS

    const result = await pool.query(getUsersFavoriteListingsQuery, [userId])

    res.status(200).json(result.rows)

  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error'});
  }
})


// POST /users/<user_id>/favorites/listing_id
router.post('/:userId/favorites/:listingId', async(req, res) => {
  const userId = req.params.userId;
  const listingId = req.params.listingId;

  try {
    await validateModelById('user_profile', userId);
    await validateModelById('listing', listingId);

    // const insertUserFavoriteQuery = `
    //   INSERT INTO user_favorite_listing (user_id, listing_id, created_at)
    //   VALUES ($1, $2, CURRENT_TIMESTAMP)
    //   RETURNING *;
    // `;

    const insertUserFavoriteQuery = favoriteQueries.CREATE_USER_FAVORITE_LISTING

    // await pool.query(insertUserFavoriteQuery, [userId, listingId])

    const result = await pool.query(insertUserFavoriteQuery, [userId, listingId])

    // const selectInsertedUserFavoriteQuery = `
    //   SELECT * FROM user_favorite_listing 
    //   WHERE user_id = $1 AND listing_id = $2
    // `
    // const result = await pool.query (selectInsertedUserFavoriteQuery, [userId, listingId])

    res.status(201).json(result.rows)

  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error'});
  }
})


// DELETE /users/<user_id>/favorites/listing_id
router.delete('/:userId/favorites/:listingId', async(req, res) => {
  const userId = req.params.userId;
  const listingId = req.params.listingId;

  try {
    await validateModelById('user_profile', userId);
    await validateModelById('listing', listingId);
    // Varify if userid and listingid is a valid combination
    // const deleteUserFavoriteQuery = `
    //   DELETE FROM user_favorite_listing
    //   WHERE user_id = $1 AND listing_id = $2
    //   RETURNING *;
    // `;

    const deleteUserFavoriteQuery = favoriteQueries.DELETE_USER_FAVORITE_LISTING;
    const result = await pool.query(deleteUserFavoriteQuery, [userId, listingId])

    // Verify if the (user_id, listing_id) pair exists
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Favorite listing not found for this user" });
    }

    res.status(204).send();

  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error'});
  }
});



// POST /users/login
// verify users login 
router.post('/login', async(req, res) => {
  const requestBody = req.body

  try {
    await validateModelRequiredFields('user_profile', requestBody)

    const selectUserByEmailQuery = `
      SELECT * FROM user_profile
      WHERE email = $1;
    `;

    const email = req.body.email

    const result = await pool.query(selectUserByEmailQuery, [email])

    if (result.rows.length === 0) {
      return res.status(404).json({"message": "User with this email does not exist"})
    }

    res.status(200).json(result.rows[0])

  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal server error'});
  }
});

module.exports = router;
