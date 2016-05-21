module.exports = (ProductManager) => {
  const router = require('express').Router()

  router.get('/', (req, res) => {
    ProductManager.getProducts()
      .then(products => res.json(products))
  })

  router.post('/', (req, res) => {
    let {name, price, sizes,} = req.body
    price = Number(price)
    ProductManager.createProduct(name, price, sizes)
      .then(product => res.json(product))
      .catch(message => res.status(400).json({message}))
  })

  router.delete('/:id', (req, res) => {
    const {id,} = req.params
    ProductManager.deleteProduct(id)
      .then(() => res.json())
  })

  return router
}
