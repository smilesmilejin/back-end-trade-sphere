# Express Application Generator

This guide walks you through creating an Express app using the official Express application generator.

For more information, visit the official Express Generator documentation:  
[Express Application Generator Documentation](https://expressjs.com/en/starter/generator.html)

## Steps to Set Up the Express App

1. **Create the App Folder**
   Run the following command to create a new Express app inside the `myapp` folder:

   ```bash
   $ npx express-generator back-end-trade-sphere

2. **Navigate to the App Folder**

   Change to the newly created app directory:
   ```bash
   $ cd back-end-trade-sphere
   ```
3. **Install Dependencies**

   ```bash
   $ npm install
   ```

4. **On MacOS or Linux, run the app with this command:**
   ```bash
   $ DEBUG=myapp:* npm start
   ```

   ```
   npm start
   ```
5. **It runs in the following:**
```
http://localhost:3000/
```

# Create PostgreSQL Database
```
psql -U postgres
```

```
CREATE DATABASE trade_sphere;
\c trade_sphere
\dt
```




# Install pg
https://node-postgres.com
node-postgres is a collection of node.js modules for interfacing with your PostgreSQL database.

**1. Run to Install pg**

```
$ npm install pg
```




**2. Create folder and file in root directory: db/index.js**
https://node-postgres.com/features/connecting
Connetion URI

Put the following to config/db.js
```js
require('dotenv').config()
// console.log(process.env)  # this is to test if dotenv is working

// import pg from 'pg'
const pg = require('pg');
const { Pool, Client } = pg

// const connectionString = 'postgres://postgres:postgres@localhost:5432/node_pg'
const connectionString = process.env.DATABASE_URL;
console.log('connection string is: ', connectionString)

 
const pool = new Pool({
  connectionString,
})
 

const client = new Client({
  connectionString,
})

module.exports = { pool, client };
```


**3. Create folder and file in root directory: db/test-db.js**
Run the following to test database connection:
```
$ node db/test-db.js
```


**4. Run the following to test database query:** 
```
$ node db/test-query.js
```

# Install dotenv to load .env
https://www.npmjs.com/package/dotenv

1. Install dotenv
```
npm install dotenv
```

2. Create a .env file at your project root, add the following to .env file
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/<database_name>
```

3. Add this to the top of db/index.js
```
require('dotenv').config();
```

4. Retrieve the following DATABASE_URL from .env
```
const connectionString = process.env.DATABASE_URL;
``

5. Try to print the environmental variables
```
console.log(process.env.DATABASE_URL)
```

4. Run node db/index.js to see if DATABASE_URL is printed
```
node db/index.js
```

# Install Migration Tools  - node-pg-migrate
[node-pg-migrate](https://github.com/salsita/node-pg-migrate/blob/main/README.md)

https://github.com/salsita/node-pg-migrate/blob/main/README.md

Doc:
https://salsita.github.io/node-pg-migrate/

1. **Check if pg is installed**

1.Check your package.json
    Look inside the dependencies section. If you see "pg": "..." listed, it's installed.

    Example snippet:
    ```
    "dependencies": {
    "pg": "^8.16.3",
    // other packages...
    }
    ``
2. Use npm/yarn to check
    Run this command in your project root terminal:
    ```
    npm list pg
    ```
    MacBook-Pro-7:node-pg xinshuangjin$ npm list pg
    node-pg@0.0.0 /Users/xinshuangjin/Developer/capstone/node-pg
    └─┬ pg@8.16.3
    └─┬ pg-pool@3.10.1
        └── pg@8.16.3 deduped

2. **Installation**
```
npm add --save-dev node-pg-migrate
```


3. **Add to package.json**

Add "migrate": "node-pg-migrate" to scripts section of your package.json so you are able to quickly run commands.
```
  "scripts": {
    "start": "node ./bin/www",
    "migrate": "node-pg-migrate"
  },
```

Run
```
npm run migrate create my-first-migration
```

It will create file xxx_my-first-migration.js in migrations folder.


Open it and change contents to:
```js
export const up = (pgm) => {
  pgm.createTable('users', {
    id: 'id',
    name: { type: 'varchar(1000)', notNull: true },
    createdAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
  pgm.createTable('posts', {
    id: 'id',
    userId: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    body: { type: 'text', notNull: true },
    createdAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
  pgm.createIndex('posts', 'userId');
};
```


Now you should put your DB connection string to DATABASE_URL environment variable and run npm run migrate up.  
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/node_pg npm run migrate up
```

``` npm run migrate up ```

Response:

```
MacBook-Pro-7:back-end-trade-sphere xinshuangjin$ npm run migrate up

> back-end-trade-sphere@0.0.0 migrate
> node-pg-migrate up

[dotenv@17.2.0] injecting env (1) from .env (tip: 🔐 prevent committing .env to code: https://dotenvx.com/precommit)
(node:3327) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/xinshuangjin/Developer/capstone/back-end-trade-sphere/migrations/1753128348632_my-first-migration.js is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/xinshuangjin/Developer/capstone/back-end-trade-sphere/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
> Migrating files:
> - 1753128348632_my-first-migration
### MIGRATION 1753128348632_my-first-migration (UP) ###
CREATE TABLE "user_profile" (
  "user_id" serial PRIMARY KEY,
  "email" varchar(255) NOT NULL,
  "name" varchar(255),
  "address" text,
  "created_at" timestamp DEFAULT current_timestamp NOT NULL,
  "updated_at" timestamp DEFAULT current_timestamp NOT NULL
);
CREATE TABLE "listing" (
  "listing_id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  "name" varchar(255),
  "category" varchar(100),
  "description" text,
  "price" numeric(12,2),
  "location" varchar(255),
  "contact_information" varchar(255),
  "created_at" timestamp DEFAULT current_timestamp NOT NULL,
  "updated_at" timestamp DEFAULT current_timestamp NOT NULL,
  "sold_status" boolean DEFAULT false NOT NULL
);
CREATE TABLE "image" (
  "image_id" serial PRIMARY KEY,
  "listing_id" integer NOT NULL REFERENCES listing(listing_id) ON DELETE CASCADE,
  "image_url" text NOT NULL
);
CREATE TABLE "user_favorite_listing" (
  "user_id" integer NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  "listing_id" integer NOT NULL REFERENCES listing(listing_id) ON DELETE CASCADE,
  "created_at" timestamp DEFAULT current_timestamp NOT NULL,
  CONSTRAINT "user_favorite_listing_pkey" PRIMARY KEY ("user_id", "listing_id")
);
INSERT INTO "public"."pgmigrations" (name, run_on) VALUES ('1753128348632_my-first-migration', NOW());


Migrations complete!
MacBook-Pro-7:back-end-trade-sphere xinshuangjin$ 
```

# Create PostgresSQL database locally to confirm two those two tables
You should now have four tables in your DB: ```user_profile```, ```listing```, ```image```, ```user_favorite_listing```
```bash
$ psql -U postgres
\c trade-sphere;
\dt
```

# Create a PostgreSQL database in Render.com

The following error occurs:

```
MacBook-Pro-7:back-end-trade-sphere xinshuangjin$ node db/test-db.js
[dotenv@17.2.0] injecting env (1) from .env (tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild)
connection string is: XXX
❌ Pool error: SSL/TLS required
❌ Client error: SSL/TLS required
MacBook-Pro-7:back-end-trade-sphere xinshuangjin$ 
```

Solution: Need to add SSL Options

SSL (Secure Sockets Layer) options control whether the connection between your app and the PostgreSQL server is encrypted.


Add SSL options in db/index.js:

```js

// Add SSL options
const sslOptions = {
  ssl: {
    require: true,
    rejectUnauthorized: false, // ⚠️ Accept Render's certs (safe for development)
  },
};

```

Fixed the Problem: 
```
MacBook-Pro-7:back-end-trade-sphere xinshuangjin$ node db/test-db.js
[dotenv@17.2.0] injecting env (1) from .env (tip: ⚙️  load multiple .env files with { path: ['.env.local', '.env'] })
connection string is:  xxx
✅ Pool connected: 2025-07-21T21:18:12.654Z
✅ Client connected: 2025-07-21T21:18:13.386Z
MacBook-Pro-7:back-end-trade-sphere xinshuangjin$ 
```

# Error when runing 
```
npm run migrate up
```

MacBook-Pro-7:back-end-trade-sphere xinshuangjin$ npm run migrate up

> back-end-trade-sphere@0.0.0 migrate
> node-pg-migrate up

[dotenv@17.2.0] injecting env (1) from .env (tip: ⚙️  enable debug logging with { debug: true })
could not connect to postgres: error: SSL/TLS required
    at Parser.parseErrorMessage (/Users/xinshuangjin/Developer/capstone/back-end-trade-sphere/node_modules/pg-protocol/dist/parser.js:285:98)
    at Parser.handlePacket (/Users/xinshuangjin/Developer/capstone/back-end-trade-sphere/node_modules/pg-protocol/dist/parser.js:122:29)
    at Parser.parse (/Users/xinshuangjin/Developer/capstone/back-end-trade-sphere/node_modules/pg-protocol/dist/parser.js:35:38)
    at Socket.<anonymous> (/Users/xinshuangjin/Developer/capstone/back-end-trade-sphere/node_modules/pg-protocol/dist/index.js:11:42)
    at Socket.emit (node:events:507:28)
    at addChunk (node:internal/streams/readable:559:12)
    at readableAddChunkPushByteMode (node:internal/streams/readable:510:3)
    at Readable.push (node:internal/streams/readable:390:5)
    at TCP.onStreamRead (node:internal/stream_base_commons:189:23) {
  length: 37,
  severity: 'FATAL',
  code: '28000',
  detail: undefined,
  hint: undefined,
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: undefined,
  line: undefined,
  routine: undefined
}
error: SSL/TLS required
    at Parser.parseErrorMessage (/Users/xinshuangjin/Developer/capstone/back-end-trade-sphere/node_modules/pg-protocol/dist/parser.js:285:98)
    at Parser.handlePacket (/Users/xinshuangjin/Developer/capstone/back-end-trade-sphere/node_modules/pg-protocol/dist/parser.js:122:29)
    at Parser.parse (/Users/xinshuangjin/Developer/capstone/back-end-trade-sphere/node_modules/pg-protocol/dist/parser.js:35:38)
    at Socket.<anonymous> (/Users/xinshuangjin/Developer/capstone/back-end-trade-sphere/node_modules/pg-protocol/dist/index.js:11:42)
    at Socket.emit (node:events:507:28)
    at addChunk (node:internal/streams/readable:559:12)
    at readableAddChunkPushByteMode (node:internal/streams/readable:510:3)
    at Readable.push (node:internal/streams/readable:390:5)
    at TCP.onStreamRead (node:internal/stream_base_commons:189:23) {
  length: 37,
  severity: 'FATAL',
  code: '28000',
  detail: undefined,
  hint: undefined,
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: undefined,
  line: undefined,
  routine: undefined


Solution: Add to the end of DATABASE_URL in .env file
```
?sslmode=require
```

The migration is successful:

```
postgres=# \c postgresql://trade_sphere_db_2sjj_user:iUCgjmtB1WE1gt3LvHXActaRcK2Zfi88@dpg-d1vap8re5dus739kmef0-a.oregon-postgres.render.com/trade_sphere_db_2sjj
psql (14.17 (Homebrew), server 16.9 (Debian 16.9-1.pgdg120+1))
WARNING: psql major version 14, server major version 16.
         Some psql features might not work.
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_128_GCM_SHA256, bits: 128, compression: off)
You are now connected to database "trade_sphere_db_2sjj" as user "trade_sphere_db_2sjj_user" on host "dpg-d1vap8re5dus739kmef0-a.oregon-postgres.render.com" (address "35.227.164.209") at port "5432".
trade_sphere_db_2sjj=> \dt
                         List of relations
 Schema |         Name          | Type  |           Owner           
--------+-----------------------+-------+---------------------------
 public | image                 | table | trade_sphere_db_2sjj_user
 public | listing               | table | trade_sphere_db_2sjj_user
 public | pgmigrations          | table | trade_sphere_db_2sjj_user
 public | user_favorite_listing | table | trade_sphere_db_2sjj_user
 public | user_profile          | table | trade_sphere_db_2sjj_user
(5 rows)

trade_sphere_db_2sjj=> SELECT * FROM user_profile;
 user_id | email | name | address | created_at | updated_at 
---------+-------+------+---------+------------+------------
(0 rows)

trade_sphere_db_2sjj=> \q
MacBook-Pro-7:back-end-trade-sphere xinshuangjin$ 
```
# Add routes/routes_utilities.js  


# Convert timestampe to timestampz to handle times zone differences: 


Create a new migration file inside your migrations folder.
The file will be named with a timestamp prefix plus add-timestamptz-to-all-tables.js, for example:

```
npx node-pg-migrate create add-timestamptz-to-all-tables --migrations-dir migrations
```

run 

```npm run migrate up```
```
MacBook-Pro-7:back-end-trade-sphere xinshuangjin$ npm run migrate up

> back-end-trade-sphere@0.0.0 migrate
> node-pg-migrate up

[dotenv@17.2.0] injecting env (1) from .env (tip: 🔐 encrypt with dotenvx: https://dotenvx.com)
(node:20968) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///Users/xinshuangjin/Developer/capstone/back-end-trade-sphere/migrations/1753308706123_add-timestamptz-to-all-tables.js is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /Users/xinshuangjin/Developer/capstone/back-end-trade-sphere/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
> Migrating files:
> - 1753308706123_add-timestamptz-to-all-tables
### MIGRATION 1753308706123_add-timestamptz-to-all-tables (UP) ###
ALTER TABLE "user_profile"
  ALTER "created_at" SET DEFAULT current_timestamp,
  ALTER "created_at" SET DATA TYPE timestamptz,
  ALTER "created_at" SET NOT NULL;
ALTER TABLE "user_profile"
  ALTER "updated_at" SET DEFAULT current_timestamp,
  ALTER "updated_at" SET DATA TYPE timestamptz,
  ALTER "updated_at" SET NOT NULL;
ALTER TABLE "listing"
  ALTER "created_at" SET DEFAULT current_timestamp,
  ALTER "created_at" SET DATA TYPE timestamptz,
  ALTER "created_at" SET NOT NULL;
ALTER TABLE "listing"
  ALTER "updated_at" SET DEFAULT current_timestamp,
  ALTER "updated_at" SET DATA TYPE timestamptz,
  ALTER "updated_at" SET NOT NULL;
ALTER TABLE "user_favorite_listing"
  ALTER "created_at" SET DEFAULT current_timestamp,
  ALTER "created_at" SET DATA TYPE timestamptz,
  ALTER "created_at" SET NOT NULL;
INSERT INTO "public"."pgmigrations" (name, run_on) VALUES ('1753308706123_add-timestamptz-to-all-tables', NOW());


Migrations complete!
MacBook-Pro-7:back-end-trade-sphere xinshuangjin$ 
```

# Confirm if columns changes to tables

```
\d user_profile
```

```
trade_sphere_db_2sjj=> \d user_profile
                                         Table "public.user_profile"
   Column   |           Type           | Collation | Nullable |                    Default                    
------------+--------------------------+-----------+----------+-----------------------------------------------
 user_id    | integer                  |           | not null | nextval('user_profile_user_id_seq'::regclass)
 email      | character varying(255)   |           | not null | 
 name       | character varying(255)   |           |          | 
 address    | text                     |           |          | 
 created_at | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
 updated_at | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
Indexes:
    "user_profile_pkey" PRIMARY KEY, btree (user_id)
Referenced by:
    TABLE "listing" CONSTRAINT "listing_user_id_fkey" FOREIGN KEY (user_id) REFERENCES user_profile(user_id) ON DELETE CASCADE
    TABLE "user_favorite_listing" CONSTRAINT "user_favorite_listing_user_id_fkey" FOREIGN KEY (user_id) REFERENCES user_profile(user_id) ON DELETE CASCADE
```


timestamp with time zone stores the timestamp in UTC internally and automatically handles time zone conversions.

# CORS (Cross-Origin Resource Sharing) error
You're encountering a CORS (Cross-Origin Resource Sharing) error, which is a common issue when a frontend (running on one origin, e.g., http://localhost:5173) tries to communicate with a backend server (e.g., https://back-end-trade-sphere.onrender.com) that doesn't explicitly allow requests from that origin.

Solution

https://expressjs.com/en/resources/middleware/cors.html

```
npm install cors
```


Installed
```
MacBook-Pro-7:back-end-trade-sphere xinshuangjin$ npm install cors

added 2 packages, and audited 171 packages in 1s

15 packages are looking for funding
  run `npm fund` for details

14 vulnerabilities (6 low, 5 high, 3 critical)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
MacBook-Pro-7:back-end-trade-sphere xinshuangjin$ 
```


**In app.js, to enable cors
```js
var cors = require('cors'); // Import cors
app.use(cors()); // Enable CORS before any routes
```

It is working for localhost, but NOT for deployed backend.

```
POST https://back-end-trade-sphere.onrender.com/users/login net::ERR_FAILED
dispatchXhrRequest @ axios.js?v=733aac55:1672
xhr @ axios.js?v=733aac55:1552
dispatchRequest @ axios.js?v=733aac55:2027
_request @ axios.js?v=733aac55:2248
request @ axios.js?v=733aac55:2139
httpMethod @ axios.js?v=733aac55:2277
wrap @ axios.js?v=733aac55:8
loginUserApi @ Login.jsx:18
handleSubmit @ Login.jsx:42
executeDispatch @ react-dom_client.js?v=733aac55:11736
runWithFiberInDEV @ react-dom_client.js?v=733aac55:1485
processDispatchQueue @ react-dom_client.js?v=733aac55:11772
(anonymous) @ react-dom_client.js?v=733aac55:12182
batchedUpdates$1 @ react-dom_client.js?v=733aac55:2628
dispatchEventForPluginEventSystem @ react-dom_client.js?v=733aac55:11877
dispatchEvent @ react-dom_client.js?v=733aac55:14792
dispatchDiscreteEvent @ react-dom_client.js?v=733aac55:14773Understand this error
login:1 Access to XMLHttpRequest at 'https://back-end-trade-sphere.onrender.com/users/login' from origin 'http://localhost:5173' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.Understand this error
Login.jsx:25 AxiosError {message: 'Network Error', name: 'AxiosError', code: 'ERR_NETWORK', config: {…}, request: XMLHttpRequest, …}
Login.jsx:26 Login failed: AxiosError {message: 'Network Error', name: 'AxiosError', code: 'ERR_NETWORK', config: {…}, request: XMLHttpRequest, …}
```POST https://back-end-trade-sphere.onrender.com/users/login net::ERR_FAILED
dispatchXhrRequest @ axios.js?v=733aac55:1672
xhr @ axios.js?v=733aac55:1552
dispatchRequest @ axios.js?v=733aac55:2027
_request @ axios.js?v=733aac55:2248
request @ axios.js?v=733aac55:2139
httpMethod @ axios.js?v=733aac55:2277
wrap @ axios.js?v=733aac55:8
loginUserApi @ Login.jsx:18
handleSubmit @ Login.jsx:42
executeDispatch @ react-dom_client.js?v=733aac55:11736
runWithFiberInDEV @ react-dom_client.js?v=733aac55:1485
processDispatchQueue @ react-dom_client.js?v=733aac55:11772
(anonymous) @ react-dom_client.js?v=733aac55:12182
batchedUpdates$1 @ react-dom_client.js?v=733aac55:2628
dispatchEventForPluginEventSystem @ react-dom_client.js?v=733aac55:11877
dispatchEvent @ react-dom_client.js?v=733aac55:14792
dispatchDiscreteEvent @ react-dom_client.js?v=733aac55:14773Understand this error
login:1 Access to XMLHttpRequest at 'https://back-end-trade-sphere.onrender.com/users/login' from origin 'http://localhost:5173' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.Understand this error
Login.jsx:25 AxiosError {message: 'Network Error', name: 'AxiosError', code: 'ERR_NETWORK', config: {…}, request: XMLHttpRequest, …}
Login.jsx:26 Login failed: AxiosError {message: 'Network Error', name: 'AxiosError', code: 'ERR_NETWORK', config: {…}, request: XMLHttpRequest, …}
```