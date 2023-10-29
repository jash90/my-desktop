const express = require('express')
const { body } = require('express-validator')
const knex = require('../../knexsetup')
const nodemailer = require('nodemailer')
const validationErrorHandler = require('../../middleware/validation_error_handler')

const router = express.Router()

const validationTable = [
  body('email').isEmail().notEmpty().withMessage('Email is required')
]

router.post('/forgot-password',
  validationTable,
  validationErrorHandler,
  async (req, res) => {
    // User supplies email address to send password reset link
    const { email } = req.body
    try {
      // Generate a token
      const buffer = crypto.randomBytes(20)
      const token = buffer.toString('hex')

      const user = await knex('users').where('email', email).first()

      if (!user) {
        return res.status(400).json({ message: 'User does not exist' })
      }

      // Set token and expiration in your DB
      await knex('users')
        .where('email', email)
        .update({
          resetPasswordToken: token,
          resetPasswordExpires: Date.now() + 3600000 // 1 hour
        })

      // Email the token as part of a link
      const transporter = nodemailer.createTransport({
        /* SMTP values here */
      })
      const mailOptions = {
        to: email,
        from: 'passwordreset@myapp.com',
        subject: 'Password Reset',
        text: `
        You are receiving this because you (or someone else) have requested the reset of the password for your account.
        Please click on the following link, or paste this into your browser to complete the process:
        http://${req.headers.host}/reset-password/${token}
        If you did not request this, please ignore this email and your password will remain unchanged.
      `
      }
      await transporter.sendMail(mailOptions)

      res
        .status(200)
        .json({ message: 'A password reset link has been sent to your email' })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  })

module.exports = router
