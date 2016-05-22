const ENV = process.env.NODE_ENV
const connectionUrl = process.env.POSTGRESQL_URL
const schema = process.env.POSTGRESQL_SCHEMA
console.log(`DB running on ${ENV}\nconnectionUrl: ${connectionUrl}\nschema:${schema}`)

const knex = require('knex')({
  client: 'pg',
  connection: connectionUrl,
  searchPath: schema,
})

module.exports = knex
