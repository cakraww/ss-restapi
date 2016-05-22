const connectionUrl = process.env.POSTGRESQL_URL
const schema = process.env.POSTGRESQL_SCHEMA

if (!connectionUrl || !schema) {
  console.log('> POSTGRESQL_URL or POSTGRESQL_SCHEMA is not set')
  process.exit(1)
}

const knex = require('knex')({
  client: 'pg',
  connection: connectionUrl,
  searchPath: schema,
})

module.exports = knex
