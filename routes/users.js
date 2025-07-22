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

    const getUserListingsQuery = `SELECT * FROM listing WHERE user_id = $1;`;
    const values = [useId]

    const result = await pool.query(getUserListingsQuery, values)

    // console.log(result)

    res.status(200).json(result.rows)
    
  } catch(err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }

});


// POST users/<user_id>/listings
router.post('/:userId/listings', async(req, res) => {
  const userId = req.params.userId;

  try {
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

    const result = await pool.query(insertQuery, values)

    res.status(200).json(result.rows)

  } catch(err) {
  res.status(err.statusCode || 500).json({error: err.message})
  }
})


module.exports = router;
