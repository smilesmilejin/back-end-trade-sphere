const request = require('supertest');
const app = require('../app'); // your Express app
const { pool } = require('../db/index');
const db = require('./test-helpers');


describe('GET /listings', () => {
  // Clear DB before every test
  beforeEach(async () => {
    await db.clear();
  });

  it('responds with an empty array when no listings exist', async () => {
    const res = await request(app)
      .get('/listings')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toEqual([]);

    // Now verify directly in the DB that no users exists
    const { rows } = await pool.query('SELECT * FROM listing');
    expect(rows).toEqual([]);
    expect(rows).toHaveLength(0);
  });
  
  it('responds with listings after one is inserted', async () => {
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

    const userId = userResult.rows[0].user_id;

    const listingData = {
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
      .get(`/listings`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toEqual(
        expect.objectContaining({
            listing_id: 1,
            user_id: listingData.user_id,
            name: listingData.name,
            category: listingData.category,
            description: listingData.description,
            price: listingData.price.toFixed(2), // .toFixed(2) converts the number to a string with exactly 2 decimal places, preserving trailing zeros.
            location: listingData.location,
            contact_information: listingData.contact_information,
            created_at: expect.any(String),
            updated_at: expect.any(String),
            sold_status: false,
            images: expect.any(Array),
        })
    );

    // Verify directly in DB
    const { rows } = await pool.query('SELECT * FROM listing');
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


describe('GET /listings/:listingId', () => {
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

  it('should return a listing by ID', async () => {

    const res = await request(app)
      .get(`/listings/${listingId}`)

        expect(res.statusCode).toBe(200);
        expect(typeof res.body).toBe('object');
        expect(res.body).toEqual(
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
    const { rows } = await pool.query('SELECT * FROM listing WHERE listing_id = $1', [listingId]);
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

  it('should return 400 if listing id is invalid', async () => {
    const invalidListingId = 'abc';

    const response = await request(app)
      .get(`/listings/${invalidListingId}`)
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe(`listing id <${invalidListingId}> is invalid.`);

    // Verify directly in the DB that the original user remains unchanged
    const { rows } = await pool.query('SELECT * FROM listing WHERE listing_id = $1', [listingId]);
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

  it('should return 404 if user does not exist', async () => {
    const nonExistentListingId = 99999;

    const response = await request(app)
      .get(`/listings/${nonExistentListingId}`)
      .expect(404);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe(`listing id <${nonExistentListingId}> is not found.`);

    // Verify directly in the DB that the original user remains unchanged
    const { rows } = await pool.query('SELECT * FROM listing WHERE listing_id = $1', [listingId]);
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


afterAll(async () => {
  await db.close();
});