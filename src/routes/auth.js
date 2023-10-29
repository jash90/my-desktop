// routes/auth.js
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { body, param } = require('express-validator')
const knex = require('../knexsetup')
const nodemailer = require('nodemailer')
const validationErrorHandler = require('../middleware/validation_error_handler')

const router = express.Router()

// User registration
router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/\d/)
      .withMessage('Password must contain a number')
      .matches(/[!@#$%^&*]/)
      .withMessage('Password must contain a special character')
  ],
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

// User login
router.post(
  '/login',
  [
    body('email').isEmail().notEmpty().withMessage('Email is required'),
    body('password').not().isEmpty().withMessage('Password is required')
  ],
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

router.post('/forgot-password',
  [
    body('email').isEmail().notEmpty().withMessage('Email is required')
  ],
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

router.post(
  '/reset-password/:token',
  [
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
  ],
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
