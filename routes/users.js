var express = require('express');
var router = express.Router();

const validateModelById = require('./routes-utilities');
const { pool } = require('../db/index');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

// GET /users
router.get('/', async (req, res) => {
  const query = `SELECT * FROM user_profile`;
  const result = await pool.query(query);

  res.status(200).json(result.rows);
});


// need to return result.rows, original result is: 

// {
//     "command": "SELECT",
//     "rowCount": 1,
//     "oid": null,
//     "rows": [
//         {
//             "user_id": 1,
//             "email": "john.doe@example.com",
//             "name": "John Doe",
//             "address": "123 Main St, Springfield",
//             "created_at": "2025-07-22T06:27:30.000Z",
//             "updated_at": "2025-07-22T06:27:30.000Z"
//         }
//     ],
//     "fields": [
//         {
//             "name": "user_id",
//             "tableID": 16482,
//             "columnID": 1,
//             "dataTypeID": 23,
//             "dataTypeSize": 4,
//             "dataTypeModifier": -1,
//             "format": "text"
//         },
//         {
//             "name": "email",
//             "tableID": 16482,
//             "columnID": 2,
//             "dataTypeID": 1043,
//             "dataTypeSize": -1,
//             "dataTypeModifier": 259,
//             "format": "text"
//         },
//         {
//             "name": "name",
//             "tableID": 16482,
//             "columnID": 3,
//             "dataTypeID": 1043,
//             "dataTypeSize": -1,
//             "dataTypeModifier": 259,
//             "format": "text"
//         },
//         {
//             "name": "address",
//             "tableID": 16482,
//             "columnID": 4,
//             "dataTypeID": 25,
//             "dataTypeSize": -1,
//             "dataTypeModifier": -1,
//             "format": "text"
//         },
//         {
//             "name": "created_at",
//             "tableID": 16482,
//             "columnID": 5,
//             "dataTypeID": 1114,
//             "dataTypeSize": 8,
//             "dataTypeModifier": -1,
//             "format": "text"
//         },
//         {
//             "name": "updated_at",
//             "tableID": 16482,
//             "columnID": 6,
//             "dataTypeID": 1114,
//             "dataTypeSize": 8,
//             "dataTypeModifier": -1,
//             "format": "text"
//         }
//     ],
//     "_parsers": [
//         null,
//         null,
//         null,
//         null,
//         null,
//         null
//     ],
//     "_types": {
//         "_types": {
//             "arrayParser": {},
//             "builtins": {
//                 "BOOL": 16,
//                 "BYTEA": 17,
//                 "CHAR": 18,
//                 "INT8": 20,
//                 "INT2": 21,
//                 "INT4": 23,
//                 "REGPROC": 24,
//                 "TEXT": 25,
//                 "OID": 26,
//                 "TID": 27,
//                 "XID": 28,
//                 "CID": 29,
//                 "JSON": 114,
//                 "XML": 142,
//                 "PG_NODE_TREE": 194,
//                 "SMGR": 210,
//                 "PATH": 602,
//                 "POLYGON": 604,
//                 "CIDR": 650,
//                 "FLOAT4": 700,
//                 "FLOAT8": 701,
//                 "ABSTIME": 702,
//                 "RELTIME": 703,
//                 "TINTERVAL": 704,
//                 "CIRCLE": 718,
//                 "MACADDR8": 774,
//                 "MONEY": 790,
//                 "MACADDR": 829,
//                 "INET": 869,
//                 "ACLITEM": 1033,
//                 "BPCHAR": 1042,
//                 "VARCHAR": 1043,
//                 "DATE": 1082,
//                 "TIME": 1083,
//                 "TIMESTAMP": 1114,
//                 "TIMESTAMPTZ": 1184,
//                 "INTERVAL": 1186,
//                 "TIMETZ": 1266,
//                 "BIT": 1560,
//                 "VARBIT": 1562,
//                 "NUMERIC": 1700,
//                 "REFCURSOR": 1790,
//                 "REGPROCEDURE": 2202,
//                 "REGOPER": 2203,
//                 "REGOPERATOR": 2204,
//                 "REGCLASS": 2205,
//                 "REGTYPE": 2206,
//                 "UUID": 2950,
//                 "TXID_SNAPSHOT": 2970,
//                 "PG_LSN": 3220,
//                 "PG_NDISTINCT": 3361,
//                 "PG_DEPENDENCIES": 3402,
//                 "TSVECTOR": 3614,
//                 "TSQUERY": 3615,
//                 "GTSVECTOR": 3642,
//                 "REGCONFIG": 3734,
//                 "REGDICTIONARY": 3769,
//                 "JSONB": 3802,
//                 "REGNAMESPACE": 4089,
//                 "REGROLE": 4096
//             }
//         },
//         "text": {},
//         "binary": {}
//     },
//     "RowCtor": null,
//     "rowAsArray": false,
//     "_prebuiltEmptyResultObject": {
//         "user_id": null,
//         "email": null,
//         "name": null,
//         "address": null,
//         "created_at": null,
//         "updated_at": null
//     }
// }

// POST users
router.post('/', async (req, res) => {

  // email is the only required field in user_profile table
  // console.log(req);
  console.log(req.body); // this gets the request_body from the user
  const requestBody = req.body

  // validate if all required fields in user_profile are included in the req.body
  const requiredFields = ['email'];

  const missingFields = requiredFields.filter(field =>
  requestBody[field] === undefined || requestBody[field] === null
  );

  if (missingFields.length > 0) {
    return res.status(400).json({
      details: `Missing required field(s): ${missingFields.join(', ')}`
    });
  };

  try {
    const insertQuery = `
      INSERT INTO user_profile (email, name, address, created_at, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
    `;
    const values = [
      requestBody.email,
      requestBody.name || null,
      requestBody.address || null,
    ];

    const result = await pool.query(insertQuery, values);
    const newUser = result.rows[0];

    console.log(newUser)

    // res.status(201).json({ user: newUser });
    res.status(201).json(newUser);

  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Server error' });
}

});

// https://expressjs.com/en/guide/routing.html
// Route parameters
// GET users/user_id
router.get('/:userId', async (req, res) => {
  try {
    const user = await validateModelById('user_profile', req.params.userId);
    res.status(200).json(user);
  } catch (err) {
    // res.status(err.statusCode || 500).json({ error: err.message });
    res.status(err.statusCode).json({ error: err.message });
  }
});

// PATCH users/user_id
router.patch('/:userId', async (req, res) => {
  try {
    const user = await validateModelById('user_profile', req.params.userId);

    const requestBody = req.body

    // validate if all required fields in user_profile are included in the req.body
    const requiredFields = ['email'];

    const missingFields = requiredFields.filter(field =>
    requestBody[field] === undefined || requestBody[field] === null
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        details: `Missing required field(s): ${missingFields.join(', ')}`
      });
    };


    const UpdateQuery = `
      UPDATE user_profile
      SET
        email = $1,
        name = $2,
        address = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $4
      RETURNING *;
    `;
    const values = [
      requestBody.email,
      requestBody.name || null,
      requestBody.address || null,
      req.params.userId,
    ];

    const result = await pool.query(UpdateQuery, values);
    const updatedUser = result.rows[0];

    console.log(updatedUser)
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(err.statusCode).json({ error: err.message });
  }
});


// GET users/<user_id>/listings
router.get('/:userId/listings', async (req, res) => {
  // console.log(req);

  const useId = req.params.userId;
  try {
    const user = await validateModelById('user_profile', useId);

    // const getUserListingsQuery = `SELECT * FROM listing WHERE user_id = $1;`;
    // const values = [useId]

    // const result = await pool.query(getUserListingsQuery, values)

    // console.log(result)

    // user LEFT JOIN: All listings for user 1 will be returned, regardless of whether they have images.
    // const getUserListingsAndImagesQuery = `
    //   SELECT
    //     l.listing_id AS listing_id,
    //     l.user_id,
    //     l.name,
    //     l.category,
    //     l.description,
    //     l.price,
    //     l.location,
    //     l.contact_information,
    //     l.created_at,
    //     l.updated_at,
    //     l.sold_status,
    //     i.image_id,
    //     i.image_url
    //   FROM listing l
    //   LEFT JOIN image i ON l.listing_id = i.listing_id
    //   WHERE l.user_id = $1;
    // `;

    // json_agg(i.*) AS images
    //     l.listing_id is the primary key, so PostgreSQL guarantees all other l.* columns are functionally dependent on it.
    // That's why it doesn’t require you to list every column in the GROUP BY clause — this is not standard SQL but PostgreSQL-specific.
    const getUserListingsAndImagesQuery = `
      SELECT 
        l.*,
        COALESCE(
        json_agg(i.*) FILTER (WHERE i.image_id IS NOT NULL),
        '[]'
      ) AS images
      FROM listing l
      LEFT JOIN image i ON l.listing_id = i.listing_id
      WHERE l.user_id = $1
      GROUP BY l.listing_id;
    `;

//     Good Practice (optional but safer/future-proof):
// If you ever migrate to another SQL system (e.g., MySQL or SQL Server), or want stricter SQL compliance, consider being explicit:
    // const getUserListingsAndImagesQuery = `
    // SELECT 
    // l.listing_id,
    // l.user_id,
    // l.name,
    // l.category,
    // l.description,
    // l.price,
    // l.location,
    // l.contact_information,
    // l.created_at,
    // l.updated_at,
    // l.sold_status,
    // COALESCE(json_agg(i.*) FILTER (WHERE i.image_id IS NOT NULL), '[]') AS images
    // FROM listing l
    // LEFT JOIN image i ON l.listing_id = i.listing_id
    // WHERE l.user_id = $1
    // GROUP BY 
    //   l.listing_id,
    //   l.user_id,
    //   l.name,
    //   l.category,
    //   l.description,
    //   l.price,
    //   l.location,
    //   l.contact_information,
    //   l.created_at,
    //   l.updated_at,
    // l.sold_status;
    // `;
  
    const values = [useId];

    const result = await pool.query(getUserListingsAndImagesQuery, values)

    res.status(200).json(result.rows)
    
  } catch(err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }

});


// POST users/<user_id>/listings
// To ensure that inserting into two tables happens as a single atomic operation — meaning both succeed or neither happens — you need to wrap them in a PostgreSQL transaction.
// Need to add images urls
// Add a litings with both update image table and listing table at the same time
// image might have muptiples
// https://node-postgres.com/features/transactions?utm_source=chatgpt.com
router.post('/:userId/listings', async(req, res) => {


  const userId = req.params.userId;

  const client = await pool.connect() // The client object obtained via const client = await pool.connect(); in node-postgres (pg package) gives you direct access to transaction control methods.

  try {
    await client.query('BEGIN') // ← Start transaction

    const user = await validateModelById('user_profile', userId);

    const requestBody = req.body

    const insertQuery = `
    INSERT INTO listing (user_id, name, category, description, price, location, contact_information, created_at, updated_at, sold_status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $8)
    RETURNING *
    `

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

    const insertListingresult = await client.query(insertQuery, values)

    // GET listing_id from result
    const curListingId = insertListingresult.rows[0].listing_id

    const images = Array.isArray(requestBody.images) ? requestBody.images : []; //  If requestBody.images is an array (e.g. ["url1", "url2"]), it keeps the array.  If requestBody.images is undefined, null, a string, or any non-array type — it assigns an empty array ([]), preventing crashes like .length of undefined.

    if (images.length > 0) {
      for (let img_url of images) {
        const insertImageQuery = `
        INSERT INTO image (listing_id, image_url)
        VALUES ($1, $2)
        `

        const imgValues = [
          curListingId,
          img_url,
        ];

        await client.query(insertImageQuery, imgValues)
      }

    }


    await client.query('COMMIT');      // ← Commit if everything is OK

    const getUserListingsAndImagesQuery = `
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
    `;


    const finalResult = await client.query(getUserListingsAndImagesQuery, [curListingId]);
    res.status(201).json(finalResult.rows);


  } catch(err) {
    await client.query('ROLLBACK');  // ← Rollback on failure
    throw err; 
    // res.status(err.statusCode || 500).json({error: err.message})
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

    const updateListingQuery = `
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
      RETURNING *
      `

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

    const deleteImagesByListingIdQuery = `
      DELETE FROM image
      WHERE listing_id = $1;
    `

    const deletedImages = await client.query(deleteImagesByListingIdQuery, [listingId]);


    // insert currrent images of listing_id
    const images = Array.isArray(requestBody.images) ? requestBody.images : []; //  If requestBody.images is an array (e.g. ["url1", "url2"]), it keeps the array.  If requestBody.images is undefined, null, a string, or any non-array type — it assigns an empty array ([]), preventing crashes like .length of undefined.

    if (images.length > 0) {
      for (let img_url of images) {
        const insertImageQuery = `
        INSERT INTO image (listing_id, image_url)
        VALUES ($1, $2)
        `

        const imgValues = [
          listingId,
          img_url,
        ];

        await client.query(insertImageQuery, imgValues)
      }

    }

    await client.query('COMMIT')

  const getUpdatedListingWithImagesQuery = `
    SELECT 
      l.*,
      COALESCE(json_agg(i.*) FILTER (WHERE i.image_id IS NOT NULL), '[]') AS images
    FROM listing l
    LEFT JOIN image i ON l.listing_id = i.listing_id
    WHERE l.listing_id = $1
    GROUP BY l.listing_id;
  `;

  const finalResult = await client.query(getUpdatedListingWithImagesQuery, [listingId]);
  
  res.status(200).json(finalResult.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK')
    res.status(err.statusCode || 500).json({ error: err.message });

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
    const deleteSpecificListingQuery = `
      DELETE FROM listing
      WHERE listing_id = $1
    `

    await pool.query(deleteSpecificListingQuery, [listingId])

  
    res.status(204)

  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
  
})

// GET /users/<user_id>/favorites

router.get('/:userId/favorites', async(req, res) => {
  const userId = req.params.userId;

  try {

    await validateModelById('user_profile', userId)

    const getUsersFavoriteListingsQuery = `
      SELECT 
        u.user_id, 
        l.*
      FROM user_favorite_listing u
      JOIN listing l ON l.listing_id = u.listing_id
      WHERE u.user_id = $1
    `

    const result = await pool.query(getUsersFavoriteListingsQuery, [userId])

    res.status(200).json(result.rows)

  } catch (err) {
    res.status(err.statusCode || 500).json({error: err.message})
  }
})

module.exports = router;
