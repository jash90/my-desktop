const express = require('express')
const bcrypt = require('bcrypt')
const { body } = require('express-validator')
const knex = require('../../knexsetup')
const validationErrorHandler = require('../../middleware/validation_error_handler')

const router = express.Router()

const validationTable = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must contain a special character')
]

// User registration
router.post(
  '/register',
  validationTable,
  validationErrorHandler,
  async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10) // Hash user password

      const user = await knex('users').insert({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
      })

      res.status(201).json({ message: 'User created', user })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
)

module.exports = router
