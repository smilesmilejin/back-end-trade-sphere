const request = require('supertest');
const app = require('../app'); // your Express app
const { pool } = require('../db/index');
const db = require('./test-helpers');


describe('GET /users', () => {
  // Clear DB before every test
  beforeEach(async () => {
    await db.clear();
  });

  it('responds with an empty array when no users exist', async () => {
    const res = await request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toEqual([]);

    // Now verify directly in the DB that no users exists
    const { rows } = await pool.query('SELECT * FROM user_profile');
    expect(rows).toEqual([]);
    expect(rows).toHaveLength(0);

  });
  
  it('responds with users after one is inserted', async () => {
    // Define test user
    const testUser = {
      email: 'test@example.com',
      name: 'Test User',
      address: '123 Happy Road',
    };

  // Insert user using extracted data
  await pool.query(
    `
      INSERT INTO user_profile (email, name, address)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [testUser.email, testUser.name, testUser.address]
  );

    const res = await request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toEqual(
      expect.objectContaining({
        user_id: 1, 
        email: 'test@example.com',
        name: 'Test User',
        address: '123 Happy Road',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
    );

    // Verify directly in DB
    const { rows } = await pool.query('SELECT * FROM user_profile');
    expect(rows).toEqual(expect.any(Array));
    expect(rows).toHaveLength(1);
    expect(rows[0].user_id).toBe(1);
    expect(rows[0].email).toBe(testUser.email);
    expect(rows[0].name).toBe(testUser.name);
    expect(rows[0].address).toBe(testUser.address);
    expect(rows[0]).toHaveProperty('created_at');
    expect(rows[0]).toHaveProperty('updated_at');
  });

});


describe('POST /users', () => {
  // Clear DB before every test
  beforeEach(async () => {
    await db.clear();
  });

  let userId = 1;

  it('should create a new user when valid data is sent', async () => {
    const newUser = {
      email: 'postuser@example.com',
      name: 'Post User',
      address: '123 Post Street'
    };

    const response = await request(app)
      .post('/users')
      .send(newUser)
      .expect(201);

    expect(response.body).toHaveProperty('user_id');
    expect(response.body.user_id).toBe(1);
    expect(response.body.email).toBe(newUser.email);
    expect(response.body.name).toBe(newUser.name);
    expect(response.body.address).toBe(newUser.address);
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');

    // Now verify directly in the DB that the user was inserted correctly
    const { rows } = await pool.query('SELECT * FROM user_profile WHERE user_id = $1', [userId]);
    expect(rows).toEqual(expect.any(Array));
    expect(rows).toHaveLength(1);
    expect(rows[0].user_id).toBe(userId);
    expect(rows[0].email).toBe(newUser.email);
    expect(rows[0].name).toBe(newUser.name);
    expect(rows[0].address).toBe(newUser.address);
    expect(rows[0]).toHaveProperty('created_at');
    expect(rows[0]).toHaveProperty('updated_at');
  });

  it('should return 400 if required field (email) is missing', async () => {
    const response = await request(app)
      .post('/users')
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Missing required field(s): email');
  });

  it('should return 400 if email already exists', async () => {
    const existingUser = {
      email: 'duplicate@example.com',
      name: 'Original User'
    };

    // Insert the user first
    await request(app)
      .post('/users')
      .send(existingUser)
      .expect(201);

    // Try inserting again with the same email
    const response = await request(app)
      .post('/users')
      .send(existingUser)
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Email "duplicate@example.com" is already registered');
  });

});


describe('GET /users/:userId', () => {
  const user = {
    email: 'original@example.com',
    name: 'Original Name',
    address: '123 Main St',
  };

  // Clear DB before every test
  beforeEach(async () => {
    await db.clear();

    // Insert a user to update
    await pool.query(
      `INSERT INTO user_profile (email, name, address) VALUES ($1, $2, $3) RETURNING user_id`,
      [user.email, user.name, user.address]
    );

  });

  let userId = 1;

  it('should return a user by ID', async () => {
    const response = await request(app)
      .get(`/users/${userId}`)
      .expect(200);

    expect(response.body).toHaveProperty('user_id', userId);
    expect(response.body.user_id).toBe(userId);
    expect(response.body.email).toBe(user.email);
    expect(response.body.name).toBe(user.name);
    expect(response.body.address).toBe(user.address);
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');

    // Verify directly in the DB
    const { rows } = await pool.query('SELECT * FROM user_profile WHERE user_id = $1', [userId]);
    expect(rows).toEqual(expect.any(Array));
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe(user.email);
    expect(rows[0].name).toBe(user.name);
    expect(rows[0].address).toBe(user.address);

  });

  it('should return 400 if user id is invalid', async () => {
    const invalidUserId = 'abc';

    const response = await request(app)
      .get(`/users/${invalidUserId}`)
      .send({}) // empty body
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe(`user_profile id <${invalidUserId }> is invalid.`);

    // Verify directly in the DB that the original user remains unchanged
    const { rows } = await pool.query('SELECT * FROM user_profile WHERE user_id = $1', [userId]);
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe(user.email);
    expect(rows[0].name).toBe(user.name);
    expect(rows[0].address).toBe(user.address);

  });

  it('should return 404 if user does not exist', async () => {
    const nonExistentUserId = 99999;

    const response = await request(app)
      .get(`/users/${nonExistentUserId}`)
      .send({
        email: 'newemail@example.com',
        name: 'New Name',
        address: 'New Address'
      })
      .expect(404);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe(`user_profile id <${nonExistentUserId}> is not found.`);

    // Verify directly in the DB that the original user remains unchanged
    const { rows } = await pool.query('SELECT * FROM user_profile WHERE user_id = $1', [userId]);
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe(user.email);
    expect(rows[0].name).toBe(user.name);
    expect(rows[0].address).toBe(user.address);
  });

});

describe('PATCH /users/:userId', () => {
  const user = {
    email: 'original@example.com',
    name: 'Original Name',
    address: '123 Main St',
  };

  // Clear DB before every test
  beforeEach(async () => {
    await db.clear();

    // Insert a user to update
    await pool.query(
      `INSERT INTO user_profile (email, name, address) VALUES ($1, $2, $3) RETURNING user_id`,
      [user.email, user.name, user.address]
    );

  });

  let userId = 1;

  it('should update a user when valid data is sent', async () => {
    const updatedData = {
      email: 'updated@example.com',
      name: 'Updated Name',
      address: '456 Updated Ave'
    };

    const response = await request(app)
      .patch(`/users/${userId}`)
      .send(updatedData)
      .expect(200);

    expect(response.body).toHaveProperty('user_id', userId);
    expect(response.body.user_id).toBe(userId);
    expect(response.body.email).toBe(updatedData.email);
    expect(response.body.name).toBe(updatedData.name);
    expect(response.body.address).toBe(updatedData.address);
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');

    // Verify directly in the DB
    const { rows } = await pool.query('SELECT * FROM user_profile WHERE user_id = $1', [userId]);
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe(updatedData.email);
    expect(rows[0].name).toBe(updatedData.name);
    expect(rows[0].address).toBe(updatedData.address);

  });

  it('should return 400 if required fields are missing', async () => {
    const response = await request(app)
      .patch(`/users/${userId}`)
      .send({}) // empty body
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Missing required field(s): email');

    // Verify directly in the DB that the original user remains unchanged
    const { rows } = await pool.query('SELECT * FROM user_profile WHERE user_id = $1', [userId]);
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe(user.email);
    expect(rows[0].name).toBe(user.name);
    expect(rows[0].address).toBe(user.address);

  });

  it('should return 404 if user does not exist', async () => {
    const nonExistentUserId = 99999;

    const response = await request(app)
      .patch(`/users/${nonExistentUserId}`)
      .send({
        email: 'newemail@example.com',
        name: 'New Name',
        address: 'New Address'
      })
      .expect(404);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/not found/i);
    expect(response.body.error).toBe(`user_profile id <${nonExistentUserId}> is not found.`);

    // Verify directly in the DB that the original user remains unchanged
    const { rows } = await pool.query('SELECT * FROM user_profile WHERE user_id = $1', [userId]);
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe(user.email);
    expect(rows[0].name).toBe(user.name);
    expect(rows[0].address).toBe(user.address);
  });

});

//-- Nested User Listings Routes  //
//------------------------------- //
//------------------------------- //
//------------------------------- //
//------------------------------- //
//------------------------------- //
//------------------------------- //

describe('GET /users/:userId/listings', () => {
  let userId;
  let listingId = 1;
  let listingData;

   // Clear DB before every test
    beforeEach(async () => {
        await db.clear();

        // Define test user
        const testUser = {
        email: 'getlisting@example.com',
        name: 'Get Listing User',
        address: '123 Get Listing Road',
        };

        // Insert user using extracted data
        const userResult =  await pool.query(
            `
            INSERT INTO user_profile (email, name, address)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [testUser.email, testUser.name, testUser.address]
        );

        userId = userResult.rows[0].user_id;

    });

  it('responds with an empty array when no user listings are found', async () => {
    const res = await request(app)
      .get(`/users/${userId}/listings`)
      .expect(200);

    expect(res.body).toEqual([]);

    // Now verify directly in the DB that no users exists
    const { rows } = await pool.query('SELECT * FROM listing WHERE user_id = $1', [userId]);
    expect(rows).toEqual([]);
    expect(rows).toHaveLength(0);

  });
  
  it('responds with users after one is inserted', async () => {

        listingData = {
            user_id: userId,
            name: "Earphone",
            category: "Electronics",
            description: "Great quality",
            price: 12.00,
            location: "Charlotte, NC",
            contact_information: "earphone@example.com",
        };

        const insertListingQuery = `
            INSERT INTO listing 
                (user_id, name, category, description, price, location, contact_information)
            VALUES 
                ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;

        await pool.query(insertListingQuery, [
            listingData.user_id,
            listingData.name,
            listingData.category,
            listingData.description,
            listingData.price,
            listingData.location,
            listingData.contact_information,
        ]);

    const res = await request(app)
      .get(`/users/${userId}/listings`)
      .expect(200);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toEqual(
      expect.objectContaining({
        listing_id: listingId,
        user_id: listingData.user_id,
        name: listingData.name,
        category: listingData.category,
        description: listingData.description,
        price: listingData.price.toFixed(2),
        location: listingData.location,
        contact_information: listingData.contact_information,
        created_at: expect.any(String),
        updated_at: expect.any(String),
        sold_status: false,
        images: expect.any(Array),
      })
    );

    // Verify directly in DB
    const { rows } = await pool.query('SELECT * FROM listing WHERE user_id = $1', [userId]);
    expect(rows).toEqual(expect.any(Array));
    expect(rows).toHaveLength(1);
    expect(rows[0].listing_id).toBe(1);
    expect(rows[0].user_id).toBe(listingData.user_id);
    expect(rows[0].name).toBe(listingData.name);
    expect(rows[0].category).toBe(listingData.category);
    expect(rows[0].description).toBe(listingData.description);
    expect(rows[0].price).toBe(listingData.price.toFixed(2));
    expect(rows[0]).toHaveProperty('created_at');
    expect(rows[0]).toHaveProperty('updated_at');
    expect(rows[0].sold_status).toBe(false);

  });

});

describe('POST /users/:userId/listings', () => {
  let userId;
  let listingId = 1;
  let postListingData;

   // Clear DB before every test
    beforeEach(async () => {
        await db.clear();

        // Define test user
        const testUser = {
        email: 'getlisting@example.com',
        name: 'Get Listing User',
        address: '123 Get Listing Road',
        };

        // Insert user using extracted data
        const userResult =  await pool.query(
            `
            INSERT INTO user_profile (email, name, address)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [testUser.email, testUser.name, testUser.address]
        );

        userId = userResult.rows[0].user_id;

    });
  
  it('responds with listings after one is inserted', async () => {
      postListingData = {
        user_id: userId,
        name: "Earphone",
        category: "Electronics",
        description: "Great quality",
        price: 12.00,
        location: "Charlotte, NC",
        contact_information: "earphone@example.com",
        images: ["image_url.com1", "image_url.com2"],
      };

    const res = await request(app)
      .post(`/users/${userId}/listings`)
      .send(postListingData)
      .expect(201);

    expect(res.statusCode).toBe(201);
    expect(res.body.length).toBe(1);
    expect(Array.isArray(res.body)).toBe(true);

    expect(res.body[0]).toEqual(
        expect.objectContaining({
        listing_id: listingId,
        user_id: postListingData.user_id,
        name: postListingData.name,
        category: postListingData.category,
        description: postListingData.description,
        price: postListingData.price.toFixed(2),
        location: postListingData.location,
        contact_information: postListingData.contact_information,
        created_at: expect.any(String),
        updated_at: expect.any(String),
        sold_status: false,
        images: expect.any(Array),
        })
    );

    // Verify directly in DB - listing table
    const { rows } = await pool.query('SELECT * FROM listing WHERE user_id = $1', [userId]);
    expect(rows).toEqual(expect.any(Array));
    expect(rows).toHaveLength(1);
    expect(rows[0].listing_id).toBe(listingId);
    expect(rows[0].user_id).toBe(postListingData.user_id);
    expect(rows[0].name).toBe(postListingData.name);
    expect(rows[0].category).toBe(postListingData.category);
    expect(rows[0].description).toBe(postListingData.description);
    expect(rows[0].price).toBe(postListingData.price.toFixed(2));
    expect(rows[0]).toHaveProperty('created_at');
    expect(rows[0]).toHaveProperty('updated_at');
    expect(rows[0].sold_status).toBe(false);

      // Image query - image table
    const { rows: imageRows } = await pool.query('SELECT * FROM image WHERE listing_id = $1', [listingId]);
    expect(imageRows).toEqual(expect.any(Array));
    expect(imageRows).toHaveLength(2);

    expect(imageRows[0]).toEqual(
      expect.objectContaining({
        image_id: 1, 
        listing_id: listingId,
        image_url: postListingData.images[0],  // "image_url.com1"
      })
    );

    expect(imageRows[1]).toEqual(
      expect.objectContaining({
        image_id: 2, 
        listing_id: listingId,
        image_url: postListingData.images[1],  // "image_url.com2"
      })
    );

  });

});

describe('PATCH /users/:userId/listings/:listingId', () => {
  let userId;
  let listingId = 1;
  let ListingData;

   // Clear DB before every test
  beforeEach(async () => {
      await db.clear();

      // Define test user
      const testUser = {
      email: 'getlisting@example.com',
      name: 'Get Listing User',
      address: '123 Get Listing Road',
      };

      // Insert user using extracted data
      const userResult =  await pool.query(
          `
          INSERT INTO user_profile (email, name, address)
          VALUES ($1, $2, $3)
          RETURNING *
          `,
          [testUser.email, testUser.name, testUser.address]
      );

      userId = userResult.rows[0].user_id;

      listingData = {
          user_id: userId,
          name: "Earphone",
          category: "Electronics",
          description: "Great quality",
          price: 12.00,
          location: "Charlotte, NC",
          contact_information: "earphone@example.com",
      };

      const insertListingQuery = `
          INSERT INTO listing 
              (user_id, name, category, description, price, location, contact_information)
          VALUES 
              ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *;
      `;

      await pool.query(insertListingQuery, [
          listingData.user_id,
          listingData.name,
          listingData.category,
          listingData.description,
          listingData.price,
          listingData.location,
          listingData.contact_information,
      ]);
  });
  
  it('responds with listings after one is updated', async () => {
     updateListingData = {
        name: "Earphone2",
        category: "Electronics2",
        description: "Great quality2",
        price: 12.00,
        location: "Charlotte, NC",
        contact_information: "earphone2@example.com",
        images: ["2image_url.com1", "2image_url.com2"],
      };

    const res = await request(app)
      .patch(`/users/${userId}/listings/${listingId}`)
      .send(updateListingData)
      .expect(200);

    expect(res.statusCode).toBe(200);
    expect(typeof res.body).toBe('object');

    expect(res.body).toEqual(
      expect.objectContaining({
        listing_id: listingId,
        user_id: userId,
        name: updateListingData.name,
        category: updateListingData.category,
        description: updateListingData.description,
        price: updateListingData.price.toFixed(2),
        location: updateListingData.location,
        contact_information: updateListingData.contact_information,
        sold_status: false,
        created_at: expect.any(String),
        updated_at: expect.any(String),
        images: expect.arrayContaining([
          expect.objectContaining({
            image_id: 1,
            image_url: updateListingData.images[0],
            listing_id: listingId
          }),
          expect.objectContaining({
            image_id: 2,
            image_url: updateListingData.images[1],
            listing_id: listingId
          }),
        ])
      })
    );

    // Verify directly in DB - listing table
    const { rows } = await pool.query('SELECT * FROM listing WHERE listing_id = $1', [listingId]);
    expect(rows).toEqual(expect.any(Array));
    expect(rows).toHaveLength(1);
    expect(rows[0].listing_id).toBe(listingId);
    expect(rows[0].user_id).toBe(userId);
    expect(rows[0].name).toBe(updateListingData.name);
    expect(rows[0].category).toBe(updateListingData.category);
    expect(rows[0].description).toBe(updateListingData.description);
    expect(rows[0].price).toBe(updateListingData.price.toFixed(2));
    expect(rows[0]).toHaveProperty('created_at');
    expect(rows[0]).toHaveProperty('updated_at');
    expect(rows[0].sold_status).toBe(false);

      // Image query - image table
    const { rows: imageRows } = await pool.query('SELECT * FROM image WHERE listing_id = $1', [listingId]);
    expect(imageRows).toEqual(expect.any(Array));
    expect(imageRows).toHaveLength(2);

    expect(imageRows[0]).toEqual(
      expect.objectContaining({
        image_id: 1, 
        listing_id: listingId,
        image_url: updateListingData.images[0],  // "image_url.com1"
      })
    );

    expect(imageRows[1]).toEqual(
      expect.objectContaining({
        image_id: 2, 
        listing_id: listingId,
        image_url: updateListingData.images[1],  // "image_url.com2"
      })
    );

  });

});



describe('DELETE /users/:userId/listings/:listingId', () => {
  let userId;
  let listingId = 1;
  let listingData;

   // Clear DB before every test
    beforeEach(async () => {
        await db.clear();

        // Define test user
        const testUser = {
        email: 'getlisting@example.com',
        name: 'Get Listing User',
        address: '123 Get Listing Road',
        };

        // Insert user using extracted data
        const userResult =  await pool.query(
            `
            INSERT INTO user_profile (email, name, address)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [testUser.email, testUser.name, testUser.address]
        );

        userId = userResult.rows[0].user_id;

        listingData = {
            user_id: userId,
            name: "Earphone",
            category: "Electronics",
            description: "Great quality",
            price: 12.00,
            location: "Charlotte, NC",
            contact_information: "earphone@example.com",
        };

        const insertListingQuery = `
            INSERT INTO listing 
                (user_id, name, category, description, price, location, contact_information)
            VALUES 
                ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;

        await pool.query(insertListingQuery, [
            listingData.user_id,
            listingData.name,
            listingData.category,
            listingData.description,
            listingData.price,
            listingData.location,
            listingData.contact_information,
        ]);
    });

  
  it('responds with 204 after listing is deleted', async () => {

    const res = await request(app)
      .delete(`/users/${userId}/listings/${listingId}`)
      .expect(204);

    expect(res.statusCode).toBe(204);
    expect(res.body).toEqual({}); 

    // Verify directly in DB - listing is deleted from the table
    const { rows } = await pool.query('SELECT * FROM listing WHERE listing_id = $1', [listingId]);
    expect(rows).toEqual(expect.any(Array));
    expect(rows).toHaveLength(0);

  });

});

//------- Favorites ------------- //
//------------------------------- //
//------------------------------- //
//------------------------------- //
//------------------------------- //
//------------------------------- //
//------------------------------- //
describe('GET /users/:userId/favorites', () => {
  let userId;
  let listingId;
  let listingData;

  beforeEach(async () => {
        await db.clear();

      // Define test user
      const testUser = {
      email: 'getlisting@example.com',
      name: 'Get Listing User',
      address: '123 Get Listing Road',
      };

      // Insert user using extracted data
      const userResult =  await pool.query(
          `
          INSERT INTO user_profile (email, name, address)
          VALUES ($1, $2, $3)
          RETURNING *
          `,
          [testUser.email, testUser.name, testUser.address]
      );

      userId = userResult.rows[0].user_id;

  })

  it('responds with an empty array when user have no favorites', async () => {
    const res = await request(app)
      .get(`/users/${userId}/favorites`)
      .expect(200);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);

    // Now verify directly in the DB that no users exists
    const { rows } = await pool.query('SELECT * FROM user_favorite_listing');
    expect(rows).toEqual([]);
    expect(rows).toHaveLength(0);
  });
  
  it('responds with 200 after one favorite is inserted', async () => {
    listingData = {
      user_id: userId,
      name: "Earphone",
      category: "Electronics",
      description: "Great quality",
      price: 12.00,
      location: "Charlotte, NC",
      contact_information: "earphone@example.com",
    };

    const insertListingQuery = `
        INSERT INTO listing 
            (user_id, name, category, description, price, location, contact_information)
        VALUES 
            ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;

    const listingResult = await pool.query(insertListingQuery, [
        listingData.user_id,
        listingData.name,
        listingData.category,
        listingData.description,
        listingData.price,
        listingData.location,
        listingData.contact_information,
    ]);

    listingId = listingResult.rows[0].listing_id;

    const addFavoritesQuery = `
        INSERT INTO user_favorite_listing (user_id, listing_id)
        VALUES ($1, $2)
        RETURNING *;
    `;

    await pool.query(addFavoritesQuery, [ userId, listingId]);

    const res = await request(app)
      .get(`/users/${userId}/favorites`)
      .expect(200);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toEqual(
        expect.objectContaining({
            listing_id: listingId,
            user_id: userId,
            name: listingData.name,
            category: listingData.category,
            description: listingData.description,
            price: listingData.price.toFixed(2), // .toFixed(2) converts the number to a string with exactly 2 decimal places, preserving trailing zeros.
            location: listingData.location,
            contact_information: listingData.contact_information,
            created_at: expect.any(String),
            updated_at: expect.any(String),
            sold_status: false,
            images: [],
        })
    );

    // Verify directly in DB - favorite listing exists for the user
    const { rows } = await pool.query(
      'SELECT * FROM user_favorite_listing WHERE user_id = $1',
      [userId]
    );

    // Check that we got an array with one entry
    expect(rows).toEqual(expect.any(Array));
    expect(rows).toHaveLength(1);

    // Check the values match
    expect(rows[0].user_id).toEqual(userId);
    expect(rows[0].listing_id).toEqual(listingId);
    // Check that it has a created_at property
    expect(rows[0]).toHaveProperty('created_at');
  });

});


describe('POST /users/:userId/favorites/:listingId', () => {
  let userId;
  let listingId;
  let listingData;

  beforeEach(async () => {
    await db.clear();

    // Define test user
    const testUser = {
    email: 'getlisting@example.com',
    name: 'Get Listing User',
    address: '123 Get Listing Road',
    };

    // Insert user using extracted data
    const userResult =  await pool.query(
        `
        INSERT INTO user_profile (email, name, address)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [testUser.email, testUser.name, testUser.address]
    );

    userId = userResult.rows[0].user_id;

    listingData = {
      user_id: userId,
      name: "Earphone",
      category: "Electronics",
      description: "Great quality",
      price: 12.00,
      location: "Charlotte, NC",
      contact_information: "earphone@example.com",
    };

    const insertListingQuery = `
        INSERT INTO listing 
            (user_id, name, category, description, price, location, contact_information)
        VALUES 
            ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;

    const listingResult = await pool.query(insertListingQuery, [
        listingData.user_id,
        listingData.name,
        listingData.category,
        listingData.description,
        listingData.price,
        listingData.location,
        listingData.contact_information,
    ]);

    listingId = listingResult.rows[0].listing_id;

  })

  
  it('responds with 200 after one favorite is inserted', async () => {

    const res = await request(app)
      .post(`/users/${userId}/favorites/${listingId}`)
      .expect(201);

    expect(res.statusCode).toBe(201);
    expect(res.body.length).toBe(1);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toEqual(
        expect.objectContaining({
            listing_id: listingId,
            user_id: userId,
            created_at: expect.any(String),
        })
    );

    // Verify directly in DB - favorite listing exists for the user
    const { rows } = await pool.query(
      'SELECT * FROM user_favorite_listing WHERE user_id = $1',
      [userId]
    );

    // Check that we got an array with one entry
    expect(rows).toEqual(expect.any(Array));
    expect(rows).toHaveLength(1);

    // Check the values match
    expect(rows[0].user_id).toEqual(userId);
    expect(rows[0].listing_id).toEqual(listingId);
    // Check that it has a created_at property
    expect(rows[0]).toHaveProperty('created_at');
  });

});

describe('DELETE /users/:userId/favorites/:listingId', () => {
  let userId;
  let listingId;
  let listingData;

  beforeEach(async () => {
    await db.clear();

    // Define test user
    const testUser = {
    email: 'getlisting@example.com',
    name: 'Get Listing User',
    address: '123 Get Listing Road',
    };

    // Insert user using extracted data
    const userResult =  await pool.query(
        `
        INSERT INTO user_profile (email, name, address)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [testUser.email, testUser.name, testUser.address]
    );

    userId = userResult.rows[0].user_id;

    listingData = {
      user_id: userId,
      name: "Earphone",
      category: "Electronics",
      description: "Great quality",
      price: 12.00,
      location: "Charlotte, NC",
      contact_information: "earphone@example.com",
    };

    const insertListingQuery = `
        INSERT INTO listing 
            (user_id, name, category, description, price, location, contact_information)
        VALUES 
            ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;

    const listingResult = await pool.query(insertListingQuery, [
        listingData.user_id,
        listingData.name,
        listingData.category,
        listingData.description,
        listingData.price,
        listingData.location,
        listingData.contact_information,
    ]);

    listingId = listingResult.rows[0].listing_id;

    const addFavoritesQuery = `
        INSERT INTO user_favorite_listing (user_id, listing_id)
        VALUES ($1, $2)
        RETURNING *;
    `;

    await pool.query(addFavoritesQuery, [userId, listingId]);

  })
  
  it('responds with 204 after a favorite is deleted', async () => {

    const res = await request(app)
      .delete(`/users/${userId}/favorites/${listingId}`)
      .expect(204);

    expect(res.statusCode).toBe(204);
    expect(res.body).toEqual({});

    // Verify directly in DB - favorite listing exists for the user
    const { rows } = await pool.query(
      'SELECT * FROM user_favorite_listing WHERE user_id = $1',
      [userId]
    );

    // Verify there is no favorites
    expect(rows).toEqual(expect.any(Array));
    expect(rows).toHaveLength(0);

  });

});


//------- login     ------------- //
//------------------------------- //
//------------------------------- //
//------------------------------- //
//------------------------------- //
//------------------------------- //
//------------------------------- //


describe('POST /users/login', () => {

  let testUser;

  // Clear DB before every test
  beforeEach(async () => {
    await db.clear();

    // Define test user
    testUser = {
      email: 'test@example.com',
      name: 'Test User',
      address: '123 Happy Road',
    };

    // Insert user using extracted data
    await pool.query(
      `
        INSERT INTO user_profile (email, name, address)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [testUser.email, testUser.name, testUser.address]
    );

  });
  
  it('responds with users after one is inserted', async () => {

    const res = await request(app)
      .post('/users/login')
      .send(testUser)
      .expect(200);

      expect(res.statusCode).toBe(200);
      expect(typeof res.body).toBe('object');
      expect(res.body).toEqual(
        expect.objectContaining({
          user_id: 1, 
          email: testUser.email,
          name: testUser.name,
          address: testUser.address,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        })
    );

    // Verify directly in DB
    const { rows } = await pool.query('SELECT * FROM user_profile');
    expect(rows).toEqual(expect.any(Array));
    expect(rows).toHaveLength(1);
    expect(rows[0].user_id).toBe(1);
    expect(rows[0].email).toBe(testUser.email);
    expect(rows[0].name).toBe(testUser.name);
    expect(rows[0].address).toBe(testUser.address);
    expect(rows[0]).toHaveProperty('created_at');
    expect(rows[0]).toHaveProperty('updated_at');
  });

  it('responds with 404 when email is not found', async () => {
    const nonExistentUser = { email: "non-exist@gmail.com" };

    const res = await request(app)
      .post('/users/login')
      .send(nonExistentUser)
      .expect(404);

    expect(res.statusCode).toBe(404);
    expect(typeof res.body).toBe('object');
    expect(res.body).toEqual({
      error: "User with this email does not exist"
    });
  });

});

afterAll(async () => {
  await db.close();
});