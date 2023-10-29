const express = require('express')
const knex = require('../../knexsetup')
const authenticate = require('../../middleware/authenticate')
const { body } = require('express-validator')
const validationErrorHandler = require('../../middleware/validation_error_handler')

const router = express.Router()

router.use(authenticate) // Apply middleware

const validationTable = [
  body('endpoint').isURL().withMessage('Must be a valid URL'),
  body('method')
    .isIn(['GET', 'POST', 'PUT', 'DELETE'])
    .withMessage('Invalid HTTP method'),
  body('format').not().isEmpty().trim().withMessage('Format is required'),
  body('presentation')
    .not()
    .isEmpty()
    .trim()
    .withMessage('Presentation is required'),
  body('token')
    .not()
    .isEmpty()
    .withMessage('Token is required.')
    .isString()
    .withMessage('Token must be a string.')
]
router.post(
  '/',
  validationTable,
  validationErrorHandler,
  async (req, res) => {
    // Extract information from the request.
    const { endpoint, method, format, presentation, token } = req.body

    // Validate the required information here (omitted for brevity)

    // Insert the new configuration into the database.
    const newConfiguration = {
      endpoint,
      method,
      format,
      presentation,
      token,
      user_id: req.user.id // The authenticated user's ID.
    }

    await knex('endpoints').insert(newConfiguration)
    res.status(201).json(newConfiguration)
  }
)

module.exports = router
