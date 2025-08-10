```
npm install --save-dev jest
```

```
npm install supertest --save-dev
```


Add a test script in your package.json:
```
"scripts": {
  "test": "jest"
}
```

jest.config.js

```
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
};
```

jest.setup.js
```
require('dotenv').config({ path: '.env.test' });
```

db/index.js
change SSL options for local database
```
const isTest = process.env.NODE_ENV === 'test';

const sslOptions = !isTest
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Accept Render's certs (safe for development)
      },
    }
  : {};
```

# Problem: timezone in trade_sphere_test is local 
```
trade_sphere_test=# SELECT * FROM user_profile;
 user_id |      email       |   name    |    address     |          created_at           |          updated_at           
---------+------------------+-----------+----------------+-------------------------------+-------------------------------
       1 | test@example.com | Test User | 123 Happy Road | 2025-08-09 13:26:49.996252-04 | 2025-08-09 13:26:49.996252-04
(1 row)
```
✅ Your current PostgreSQL session in trade_sphere_test is using:
```
postgres=# \c trade_sphere_test;
You are now connected to database "trade_sphere_test" as user "postgres".
trade_sphere_test=# SHOW timezone;\
     TimeZone     
------------------
 America/New_York
(1 row)
```

⚙️ Want to change it permanently?
If you want this database (or all your sessions) to always use UTC:
Option 1: At the database level
```
ALTER DATABASE trade_sphere_test SET timezone TO 'UTC';
```

```
trade_sphere_test=# SELECT * FROM user_profile;
 user_id |      email       |   name    |    address     |          created_at           |          updated_at           
---------+------------------+-----------+----------------+-------------------------------+-------------------------------
       1 | test@example.com | Test User | 123 Happy Road | 2025-08-09 19:18:24.721864+00 | 2025-08-09 19:18:24.721864+00
(1 row)

(END)

```

```
trade_sphere_test=# SHOW TIMEZONE;
 TimeZone 
----------
 UTC
(1 row)

trade_sphere_test=# 
```