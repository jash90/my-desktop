const knex = require('../../knexsetup')
const express = require('express')

const router = express.Router()
router.get('/', async (req, res) => {
  // Retrieve the configurations from the database.
  const configurations = await knex('endpoints').where('user_id', req.user.id)
  res.status(200).json(configurations)
})

module.exports = router
