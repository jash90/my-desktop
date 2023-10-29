const {
  param,
  body
} = require('express-validator')
const validationErrorHandler = require('../../middleware/validation_error_handler')
const knex = require('../../knexsetup')
const bcrypt = require('bcrypt')
const express = require('express')

const router = express.Router()

const validationTable = [
  // Validate the token
  param('token').isString().notEmpty().withMessage('Invalid token'),

  // Validate the password
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must contain a special character')
]
router.post(
  '/reset-password/:token',
  validationTable,
  validationErrorHandler,
  async (req, res) => {
    try {
      const user = await knex('users')
        .where('resetPasswordToken', req.params.token)
        .where('resetPasswordExpires', '>', Date.now())
        .first()

      if (!user) {
        return res
          .status(400)
          .json({ message: 'Password reset token is invalid or has expired' })
      }

      // Update user's password and clear resetToken fields
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      await knex('users').where('id', user.id).update({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      })

      res.status(200).json({ message: 'Your password has been updated' })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
)

module.exports = router
