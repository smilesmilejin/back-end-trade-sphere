const request = require('supertest');
const app = require('../app'); // your Express app
const { pool } = require('../db/index');
const db = require('./test-helpers');


describe('DELETE /images/:imageId', () => {
  let userId;
  let listingId = 1;
  let postListingData;
  let imageId = 1;

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

        const imageData = "image_url.com1";

        const insertImageQuery = `INSERT INTO image (listing_id, image_url) VALUES ($1, $2) RETURNING *;`

        await pool.query(insertImageQuery, [listingId, imageData]);
    });
  
  it('responds with 204 after one image is deleted', async () => {
    const res = await request(app)
      .delete(`/images/${imageId}`)
      .expect(204);

    expect(res.statusCode).toBe(204);
    expect(res.body).toEqual({}); 

    // Verify directly in DB - listing is deleted from the table
    const { rows } = await pool.query('SELECT * FROM image WHERE image_id = $1', [imageId]);
    expect(rows).toEqual(expect.any(Array));
    expect(rows).toHaveLength(0);

  });


});

afterAll(async () => {
  await db.close();
});