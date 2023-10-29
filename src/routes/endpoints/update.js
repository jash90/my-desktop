const {
  body,
  param
} = require('express-validator')
const validationErrorHandler = require('../../middleware/validation_error_handler')
const knex = require('../../knexsetup')
const express = require('express')

const router = express.Router()

const validateTable = [
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
    .withMessage('Token must be a string.'),
  // Validate the 'id' param
  param('id').isInt().withMessage('Endpoint ID must be an integer')
]

router.put(
  '/:id',
  validateTable,
  validationErrorHandler,
  async (req, res) => {
    // Extract information from the request.
    const { endpoint, method, format, presentation, token } = req.body

    // Validate the required information here (omitted for brevity)

    // The updated configuration.
    const updatedConfiguration = {
      endpoint,
      method,
      format,
      presentation,
      token
      // No need to update user_id as it remains the same.
    }

    // Update the configuration in the database.
    await knex('endpoints')
      .where({ id: req.params.id, user_id: req.user.id })
      .update(updatedConfiguration)

    res.status(200).json(updatedConfiguration)
  }
)

module.exports = router
