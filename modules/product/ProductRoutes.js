const {PRODUCT_COLORS, PRODUCT_SIZES,} = require('./ProductConstants')
const {jsonErrorHandler,} = require('../../util')

module.exports = (ProductManager) => {
  const router = require('express').Router()

  router.get('/', (req, res) => {
    req.checkQuery('sizes', `Invalid size specified. Valid values are: ${PRODUCT_SIZES.join('/')}`)
      .optional().isSubset(PRODUCT_SIZES)
    req.checkQuery('colors', `Invalid color specified. Valid values are: ${PRODUCT_COLORS.join('/')}`)
      .optional().isSubset(PRODUCT_COLORS)
    req.checkQuery('priceMin', 'priceMin must be an integer').optional().isInt()
    req.checkQuery('priceMax', 'priceMax must be an integer').optional().isInt()

    req.asyncValidationErrors()
      .then(() => {
        const {sizes, colors,} = req.query
        const priceMin = Number.parseInt(req.query.priceMin) || null
        const priceMax = Number.parseInt(req.query.priceMax) || null
        return ProductManager.getProducts(sizes, colors, priceMin, priceMax)
          .then(products => res.json(products))
      })
      .catch(err => jsonErrorHandler(res, err))
  })

  router.get('/:id', (req, res) => {
    req.checkParams('id', 'id must be an integer').isInt()
    req.asyncValidationErrors()
      .then(() => {
        const {id,} = req.params
        return ProductManager.getProduct(id)
          .then(product => res.json(product))
      })
      .catch(err => jsonErrorHandler(res, err))
  })

  router.post('/', (req, res) => {
    req.checkBody('name', 'name is required').notEmpty()
    req.checkBody('price', 'price is required and must be an integer').notEmpty().isInt()
    req.checkBody('sizes', `Invalid size specified. Valid values are: ${PRODUCT_SIZES.join('/')}`)
      .notEmpty().isSubset(PRODUCT_SIZES)
    req.checkBody('colors', `Invalid color specified. Valid values are: ${PRODUCT_COLORS.join('/')}`)
      .notEmpty().isSubset(PRODUCT_COLORS)
    req.checkBody('categoryId', 'categoryId must be an integer').optional().isInt()

    req.asyncValidationErrors()
      .then(() => {
        let {name, price, sizes, colors, categoryId,} = req.body
        console.log('colors:', colors)
        price = Number(price)
        return ProductManager.createProduct(name, price, sizes, colors, categoryId)
          .then(product => res.json(product))
          .catch(err => jsonErrorHandler(res, err))
      })
      .catch(err => jsonErrorHandler(res, err))
  })

  router.delete('/:id', (req, res) => {
    req.checkParams('id', 'id must be an integer').isInt()
    req.asyncValidationErrors()
      .then(() => {
        const {id,} = req.params
        return ProductManager.deleteProduct(id)
          .then(() => res.json())
      })
      .catch(err => jsonErrorHandler(res, err))
  })

  return router
}
