// knex-setup.js

const environment = process.env.NODE_ENV || 'development' // 'development' by default if the environment variable is not set
const config = require('./knexfile')[environment] // Require the config for the current environment
const knex = require('knex')(config) // Initialize knex with the correct configuration

module.exports = knex
