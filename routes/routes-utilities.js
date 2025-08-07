
// https://expressjs.com/en/guide/error-handling.html
const { pool } = require('../db/index');
const userQueries = require('../db/queries/users');

const validateModelById = async (modelName, modelId) => {
    // **
    // * Validates the existence of a record in the database by model name and ID.
    // *
    // * modelName is the table name.
    // * modelId is the primary id of the table.
    // *
    // * @async
    // * @function validateModelById
    // * @param {string} modelName - The name of the database table/model to query (e.g., 'user_profile', 'listing').
    // * @param {(string|number)} modelId - The ID of the record to validate. Will be converted to a number.
    // * @throws {Error} Throws a 400 error if the ID is invalid or the modelName is unsupported.
    // * @throws {Error} Throws a 404 error if the record with the given ID does not exist.
    // * @returns {Promise<Object>} Returns a promise that resolves to the database record object if found.
    // */

    // convert modelId to number
    const id = Number(modelId);

    // Check if the id is a valid integer, otherwise throw a 400 error
    if (!Number.isInteger(id)) {
        const message = `${modelName} id <${modelId}> is invalid.`;
        const error = new Error(message)
        error.statusCode = 400
        throw error;
    };

    // Map table names to their respective ID columns
    const idColumns = {
        user_profile: 'user_id',
        listing: 'listing_id',
        // add other models here as needed
        image:'image_id'
    };

    const idColumn = idColumns[modelName]; // Get the ID column name for the given modelName

    // if table name does not exist, throw a 404 error
    if (!idColumn) {
        const message = `Validation for model ${modelName} is not supported.`;
        const error = new Error(message);
        error.statusCode = 400;
        throw error;
    }

    const query = `SELECT * FROM ${modelName} WHERE ${idColumn} = $1`; // Prepare the SQL query to find the record by ID in the specified table
    const res = await pool.query(query, [id]);

    // If no record is found, throw a 404 error
    if (res.rows.length === 0)  {
        const message = `${modelName} id <${modelId}> is not found.`;
        const error = new Error(message);
        error.statusCode = 404;
        throw error;
    }

    const model = res.rows[0]
    return model; // Return the found record

}


const validateModelRequiredFields = async(modelName, requestBody) => {
    // /**
    //  * Validates that all required fields for a specific model are present in the request body.
    //  *
    //  * @async
    //  * @function validateRequestBodyHasRequiredFields
    //  * @param {string} modelName - The name of the model/table to validate against (e.g., 'user_profile').
    //  * @param {Object} requestBody - The request body object to check.
    //  * @throws {Error} Throws a 400 error if any required fields are missing or null.
    //  */
    const requiredFields = {
        'user_profile': ['email'] // email is the only required field in user_profile table
    }

    const modelRequiredFields = requiredFields[modelName]

    // If the model is not defined in the requiredFields map, skip validation
    if (!modelRequiredFields) {
        return;
    }

    // Find which required fields are missing or null in the request body
    const missingFields = modelRequiredFields.filter(field =>
    requestBody[field] === undefined || requestBody[field] === null
    );

    if (missingFields.length > 0) {
        const message = `Missing required field(s): ${missingFields.join(', ')}`;
        const error = new Error(message);
        error.statusCode = 400;
        throw error;
    };

};


const checkEmailExistsInUserProfile = async(email) => {
    /**
     * Checks if the email already exists in the user_profile table.
     * Throws error if found, otherwise returns silently.
     *
     * @param {string} email - The email to check for uniqueness.
     * @throws {error}
     */
  const result = await pool.query(userQueries.GET_USER_BY_EMAIL, [email]);
  if (result.rows.length > 0) {
    // throw new EmailExistsError(`Email "${email}" is already registered.`);
    const message = `Email "${email}" is already registered`;
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }

}


module.exports = {
  validateModelById,
  validateModelRequiredFields,
  checkEmailExistsInUserProfile,
};