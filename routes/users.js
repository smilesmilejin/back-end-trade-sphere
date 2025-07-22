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



// https://expressjs.com/en/guide/routing.html
// Route parameters
// GET users/user_id
router.get('/:useId', async (req, res) => {
  try {
    const user = await validateModelById('user_profile', req.params.useId);
    res.status(200).json(user);
  } catch (err) {
    // res.status(err.statusCode || 500).json({ error: err.message });
    res.status(err.statusCode).json({ error: err.message });
  }
});


module.exports = router;
