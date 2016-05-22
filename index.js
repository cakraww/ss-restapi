const db = require('./db')

const productRepo = require('./modules/product/ProductRepository')(db)
const productManager = require('./modules/product/ProductManager')(productRepo)
const productRouter = require('./modules/product/ProductRoutes')(productManager)

const categoryRepo = require('./modules/category/CategoryRepository')(db)
const categoryManager = require('./modules/category/CategoryManager')(categoryRepo)
const categoryRouter = require('./modules/category/CategoryRoutes')(categoryManager)

const app = require('./app')(productRouter, categoryRouter)

module.exports = app
module.exports.db = db
