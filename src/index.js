const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const endpointsRouter = require('./routes/endpoints')
const auth = require('./routes/auth')

require('dotenv').config()

const app = express()

// Middleware
app.use(bodyParser.json())
app.use(cookieParser())

// Import your routes
// app.use('/api', require('./routes/api'));

app.use('/api/endpoints', endpointsRouter)
app.use('/api/', auth)

// Starting the server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
