// migrations/20211010_create_endpoints_table.js (example name)
exports.up = function (knex) {
  return knex.schema.createTable('endpoints', function (table) {
    table.increments()
    table.string('endpoint', 2048).notNullable()
    table.string('method').notNullable()
    table.string('format').notNullable()
    table.string('presentation').notNullable()
    table.integer('user_id').unsigned().references('id').inTable('users')
    // Other necessary fields like timestamps, etc.
    table.timestamps()
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('endpoints')
}
