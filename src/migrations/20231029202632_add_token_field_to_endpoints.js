// Create a new migration with Knex CLI
// $ knex migrate:make add_token_field_to_endpoints

exports.up = function (knex) {
  return knex.schema.table('endpoints', function (table) {
    table.string('token') // or another type appropriate for your token
  })
}

exports.down = function (knex) {
  return knex.schema.table('endpoints', function (table) {
    table.dropColumn('token')
  })
}
