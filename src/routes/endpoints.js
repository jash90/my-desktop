// routes/posts.js
const express = require('express')
const knex = require('../knexsetup')
const authenticate = require('../middleware/authenticate')
const { body, param } = require('express-validator')

const router = express.Router()

router.use(authenticate) // Apply middleware

// CREATE operation
// In your routes/endpoints.js file

router.post(
  '/',
  [
    body('endpoint').isURL().withMessage('Must be a valid URL'),
    body('method')
      .isIn(['GET', 'POST', 'PUT', 'DELETE'])
      .withMessage('Invalid HTTP method'),
    body('format').not().isEmpty().trim().withMessage('Format is required'),
    body('presentation')
      .not()
      .isEmpty()
      .trim()
      .withMessage('Presentation is required')
  ],
  async (req, res) => {
    // Extract information from the request.
    const { endpoint, method, format, presentation } = req.body

    // Validate the required information here (omitted for brevity)

    // Insert the new configuration into the database.
    const newConfiguration = {
      endpoint,
      method,
      format,
      presentation,
      user_id: req.user.id // The authenticated user's ID.
    }

    await knex('endpoints').insert(newConfiguration)
    res.status(201).json(newConfiguration)
  }
)

// READ operation
router.get('/', async (req, res) => {
  // Retrieve the configurations from the database.
  const configurations = await knex('endpoints').where('user_id', req.user.id)
  res.status(200).json(configurations)
})

// UPDATE operation
router.put(
  '/:id',
  [
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
    // Validate the 'id' param
    param('id').isInt().withMessage('Endpoint ID must be an integer')
  ],
  async (req, res) => {
    // Extract information from the request.
    const { endpoint, method, format, presentation } = req.body

    // Validate the required information here (omitted for brevity)

    // The updated configuration.
    const updatedConfiguration = {
      endpoint,
      method,
      format,
      presentation
      // No need to update user_id as it remains the same.
    }

    // Update the configuration in the database.
    await knex('endpoints')
      .where({ id: req.params.id, user_id: req.user.id })
      .update(updatedConfiguration)

    res.status(200).json(updatedConfiguration)
  }
)

// DELETE operation
router.delete('/:id', async (req, res) => {
  // Delete the configuration from the database.
  await knex('endpoints')
    .where({ id: req.params.id, user_id: req.user.id })
    .del()

  res.status(200).json({ message: 'Configuration deleted' })
})

module.exports = router
