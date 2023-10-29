const validationErrorHandler = require('../../middleware/validation_error_handler')
const knex = require('../../knexsetup')
const express = require('express')

const router = express.Router()
router.delete('/:id',
  validationErrorHandler,
  async (req, res) => {
    // Delete the configuration from the database.
    await knex('endpoints')
      .where({ id: req.params.id, user_id: req.user.id })
      .del()

    res.status(200).json({ message: 'Configuration deleted' })
  })

module.exports = router
