const knex = require('knex')({
  client: 'pg',
  connection: process.env.POSTGRESQL_URL,
  searchPath: 'public',
})

module.exports = knex
