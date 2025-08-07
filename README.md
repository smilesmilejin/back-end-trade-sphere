# TradeSphere - Capstone Back-end

## Introduction

TradeSphere is a community-driven web application designed to help people locally buy, sell, or trade items such as electronics, clothes, furniture, and more. It aims to make trading simple and accessible within local neighborhoods.

### Features
- User registration and login with email  
- Users can edit their profile  
- Ability to list new items for sale  
- Listings include details: name, category, description, price, location, pictures, and contact information  
- Users can update listing details (change name, description, add pictures)  
- Users can mark items as sold or no longer needed, or delete listings  
- Users can add favorites and view them in their profile  
- Filter items by category, availability, price, and date added  
- Users can search listings by keywords  
- Click on items to view detailed information  


## Dependencies

This project uses the following dependencies:

### Runtime Dependencies
- **express** — Web framework for Node.js  
- **pg** — PostgreSQL client for Node.js  
- **cors** — Middleware for enabling CORS  
- **cookie-parser** — Parses cookies attached to client requests  
- **dotenv** — Loads environment variables from `.env` file  
- **debug** — Debugging utility  
- **http-errors** — Creates HTTP errors  
- **jade** — Template engine (if used)  
- **morgan** — HTTP request logger  

### Development Dependencies
- **node-pg-migrate** — Database migration tool for PostgreSQL  


## One-time Project Setup - Back-End Layer

To get started with your project, follow these instructions:


### Clone

Replace <your-forked-repo-url> with your forked repository URL, and <repo-folder> with the folder name created by the clone command.

```
$ git clone <your-forked-repo-url>
```

```
$ cd <repo-folder>
```

### Install Dependencies

Run the following command to install all necessary project dependencies:

```bash
$ npm install
```


### Create a Local PostgreSQL Database

Start the PostgreSQL interactive terminal:

```bash
psql -U postgres
```

Create the database:

```
CREATE DATABASE trade_sphere;
```
This will create and connect you to a database named trade_sphere.


### Create a .env File in the Root Folder and Add Database Configuration
To connect your Node.js Express server to a PostgreSQL database, you need to add a valid connection string in a .env file.
Create a .env file in the root directory of your backend project and include your database connection string by replacing <your-database-url> with the actual URL:

```
DATABASE_URL=<your-database-url>
```


<details>
  <summary><span style="font-size:1.2em; font-weight:bold;">Option 1. Local PostgreSQL Database Connection</span></summary>


Example local connection string for a PostgreSQL setup (format: postgres://postgres:postgres@localhost:5432/YOUR_DATABASE_NAME)::

```
postgres://postgres:postgres@localhost:5432/trade_sphere
```

If your database name is different, replace trade_sphere with your database name:

```
postgres://postgres:postgres@localhost:5432/YOUR_DATABASE_NAME
```

Add this connection string to your .env file as DATABASE_URL.
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/trade_sphere
```

</details>



<details>
  <summary><span style="font-size:1.2em; font-weight:bold;">Option 2: External PostgreSQL Database Connection (e.g., Render) </span></summary>

For Render or other cloud-hosted databases, update the protocol and add SSL mode:  
- Change the URL prefix from `postgres://` to `postgresql+psycopg2://`  
- Append `?sslmode=require` to the end of the URL  

Example external PostgreSQL connection string:

```
postgresql+psycopg2://trade_sphere_db_ab12_user:A7x9KvLp3TUdceF2QpWYbnXsR4OmEi55@dpg-c3xqk8fr7g8r28v9h1b0-a.oregon-postgres.render.com/trade_sphere_db_ab12?sslmode=require
```

Add this connection string to your .env file as DATABASE_URL.
```
DATABASE_URL=postgresql+psycopg2://trade_sphere_db_ab12_user:A7x9KvLp3TUdceF2QpWYbnXsR4OmEi55@dpg-c3xqk8fr7g8r28v9h1b0-a.oregon-postgres.render.com/trade_sphere_db_ab12?sslmode=require
```
</details>



### Run Migrations
After setting up your database and .env file, run the database migrations:
```
npm run migrate up
```

### Run the Program
Start the development server. The app will be available at http://localhost:3000/.
```
$ npm start
```

