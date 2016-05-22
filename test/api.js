const ENV = process.env.NODE_ENV
if (ENV !== 'test') {
  console.log('> must be run in test environment!')
  process.exit(1)
}

const async = require('async')
const qs = require('qs')
const path = require('path')
const request = require('supertest')
const assert = require('assert')

try {
  require('dotenv').load({path: path.resolve(__dirname, '..', '.env.test'),})
} catch(e) { /* empty, env vars are set manually*/ }

const app = require('../index')
const knex = require('../index').db

const TABLES = [
  'categories',
  'products',
  'product_sizes',
  'product_colors',
]

function truncateTables() {
  const promise = Promise.resolve()
  TABLES.forEach(table => promise.then(() => {
    console.log(`[]truncating table ${table}...`)
    return knex.raw(`TRUNCATE ${table} CASCADE`)
  }))
  return promise
}

describe('SS Rest API', function() {
  this.timeout(3000)

  beforeEach(done => {
    truncateTables()
      .then(() => {
        done()
      })
  })

  describe('Category', function() {
    it('should return empty category', done => {
      request(app)
        .get('/categories')
        .expect(200)
        .expect([], done)
    })

    it('should return the category just created', done => {
      const params = {name: 'pakaian',}
      let id = null
      async.series([
        cb => request(app)
          .post('/categories').send(qs.stringify(params))
          .expect(200)
          .expect(res => {
            const cat = res.body
            id = cat.id
            assert.equal(cat.name, params.name + "sdfsd")
            assert.equal(cat.parent, null)
            assert.deepEqual(cat.children, [])
          })
          .end(cb),
        cb => request(app)
          .get(`/categories/${id}`)
          .expect(200)
          .expect(res => {
            const cat = res.body
            assert.equal(cat.name, params.name)
            assert.equal(cat.parent, null)
            assert.deepEqual(cat.children, [])
          })
          .end(cb),
      ], done)
    })

    it('should show parent\'s category & children', done => {
      const paramsA = {name: 'pakaian',}
      let paramsB = {name: 'atasan',}
      let idA = null
      let catA = null
      let catB = null
      async.series([
        cb => {
          request(app).post('/categories').send(qs.stringify(paramsA))
            .expect(res => idA = res.body.id).end(cb)
        },
        cb => {
          paramsB.parentId = idA
          request(app).post('/categories').send(qs.stringify(paramsB))
            .expect(res => catB = res.body).end(cb)
        },
        cb => {
          request(app).get(`/categories/${idA}`)
            .expect(res => catA = res.body).end(cb)
        },
      ], () => {
        assert.equal(catB.parent, catA.name)
        assert.deepEqual(catA.children, [catB.name,])
        assert.deepEqual(catB.children, [])
        done()
      })
    })

    it('should the category vanish', done => {
      const param = {name: 'pakaian',}
      let id = null
      async.series([
        cb => request(app).post('/categories').send(qs.stringify(param))
            .expect(res => id = res.body.id)
            .end(cb),
        cb => request(app).delete(`/categories/${id}`)
            .expect(200)
            .expect(res => {
              const {nDeleted,} = res.body
              assert.equal(nDeleted, 1)
            })
            .end(cb),
        cb => request(app).get(`/products/${id}`)
            .expect(404)
            .end(cb),
      ], done)
    })
  })

  describe('Product', function() {
    it('should return empty array', done => {
      request(app)
        .get('/products')
        .expect(200)
        .expect([], done)
    })

    it('should return the product just created', done => {
      const catParams = {name: 'pakaian',}
      let cat = null
      async.series([
        cb => request(app)
          .post('/categories').send(qs.stringify(catParams))
          .expect(res => cat= res.body)
          .end(cb),
        cb => {
          const params = {name: 'baju uniql*', price: 50000, sizes: ['L',], colors: ['Red', 'Blue',], categoryId: cat.id,}
          request(app)
          .post('/products').send(qs.stringify(params))
          .expect(200)
          .expect(res => {
            const result = res.body
            assert.equal(result.name, params.name)
            assert.equal(result.price, params.price)
            assert.equal(result.category, cat.name)
            assert.deepEqual(result.sizes, params.sizes)
            assert.deepEqual(result.colors, params.colors)
          })
          .end(cb)
        },
      ], done)
    })

    it('should the product vanish', done => {
      const param = {name: 'celana training', price: 100000,}
      let id = null
      async.series([
        cb => request(app).post('/products').send(qs.stringify(param))
            .expect(res => id = res.body.id)
            .end(cb),
        cb => request(app).delete(`/products/${id}`)
            .expect(200)
            .expect(res => {
              const {nDeleted,} = res.body
              assert.equal(nDeleted, 1)
            })
            .end(cb),
        cb => request(app).get(`/products/${id}`)
            .expect(404)
            .end(cb),
      ], done)
    })
  })
})
