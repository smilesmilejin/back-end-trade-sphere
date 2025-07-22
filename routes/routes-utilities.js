
// https://expressjs.com/en/guide/error-handling.html

const { pool } = require('../db/index');

const validateModelById = async (modelName, modelId) => {

    // convert modelId to number
    const id = Number(modelId);

    if (!Number.isInteger(id)) {
        const message = `${modelName} id <${modelId}> is invalid.`;
        // throw new Error(message);
        const error = new Error(message)
        error.statusCode = 400
        throw error;

        // return res.status(400).json({ message: `${ModelClass} id <${modelId}> is invalid.` });

    };

    const query = `SELECT * FROM ${modelName} WHERE user_id = $1`;
    const res = await pool.query(query, [id]);

    // [
    
    // {
    //     user_id: 1,
    //     email: 'john.doe@example.com',
    //     name: 'John Doe',
    //     address: '123 Main St, Springfield',
    //     created_at: 2025-07-22T01:27:39.041Z,
    //     updated_at: 2025-07-22T01:27:39.041Z
    // }
    // ]


    if (res.rows.length === 0)  {
        const message = `${modelName} id <${modelId}> is not found.`;
        const error = new Error(message);
        error.statusCode = 404;
        throw error;
    }

    const model = res.rows[0]

    return model;

}

module.exports = validateModelById;


// > Number('123')
// 123
// > Number('abc')
// NaN
// > 
// > Number('123.12')
// 123.12
// > 