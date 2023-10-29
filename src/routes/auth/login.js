const { body } = require('express-validator')
const validationErrorHandler = require('../../middleware/validation_error_handler')
const knex = require('../../knexsetup')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const express = require('express')

const router = express.Router()

const validationTable = [
  body('email').isEmail().notEmpty().withMessage('Email is required'),
  body('password').not().isEmpty().withMessage('Password is required')
]

router.post(
  '/login',
  validationTable,
  validationErrorHandler,
  async (req, res) => {
    try {
      console.log({ body: req.body, params: req.params })
      const user = await knex('users').where('email', req.body.email).first()

      if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return res
          .status(400)
          .json({ message: 'Email or password is incorrect' })
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '24h'
      }) // Create JWT

      res.json({ token, username: user.username })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
)

module.exports = router
