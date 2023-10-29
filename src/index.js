const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { add, get, remove, update } = require('./routes/endpoints')
const { login, register, forgotPassword, resetPassword } = require('./routes/auth')

require('dotenv').config()

const app = express()

// Middleware
app.use(bodyParser.json())
app.use(cookieParser())

// Import your routes
// app.use('/api', require('./routes/api'));

app.use('/api/', login)
app.use('/api/', register)
app.use('/api/', forgotPassword)
app.use('/api/', resetPassword)

app.use('/api/endpoints', add)
app.use('/api/endpoints', update)
app.use('/api/endpoints', remove)
app.use('/api/endpoints', get)

// Starting the server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
