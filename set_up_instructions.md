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
import pg from 'pg'
const { Pool, Client } = pg
const connectionString = 'postgresql://dbuser:secretpassword@database.server.com:3211/mydb'
 
const pool = new Pool({
  connectionString,
})
 
await pool.query('SELECT NOW()')
await pool.end()
 
const client = new Client({
  connectionString,
})
 
await client.connect()
 
await client.query('SELECT NOW()')
 
await client.end()
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