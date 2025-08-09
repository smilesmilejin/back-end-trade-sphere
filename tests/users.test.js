const request = require('supertest');
const app = require('../app'); // your Express app
const { pool } = require('../db/index');
const db = require('./test-db-setup');


describe('GET /users', () => {
  // Clear DB before every test
  beforeEach(async () => {
    await db.clear();
  });

  // afterAll(async () => {
  //   await db.close(); // Close DB pool after all tests
  // });

  it('responds with an empty array when no users exist', async () => {
    const res = await request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toEqual([]);
  });

  it('responds with users after one is inserted', async () => {
    await db.pool.query(`
      INSERT INTO user_profile (email, name, address)
      VALUES ('test@example.com', 'Test User', '123 Happy Road')
    `);

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
  });

});

describe('POST /users', () => {
  beforeEach(async () => {
    await db.clear();
  });

  // afterAll(async () => {
  //   await db.close();
  // });

  it('creates a new user with given data and returns it', async () => {
    const newUser = {
      email: 'david@example.com',
      name: 'David',
      address: 'David Road'
    };

    const res = await request(app)
      .post('/users')
      .send(newUser)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201); // Assuming your POST returns 201 Created

    expect(res.body).toEqual(
      expect.objectContaining({
        user_id: 1,
        // user_id: expect.any(Number), // should be a number
        email: newUser.email,
        name: newUser.name,
        address: newUser.address,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
    );

    // Optionally confirm the user was inserted by querying DB or GET /users
    const getRes = await request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect(200);

    expect(getRes.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: newUser.email,
          name: newUser.name,
          address: newUser.address,
        }),
      ])
    );
  });
});


afterAll(async () => {
  await pool.end();
  await db.close();
});