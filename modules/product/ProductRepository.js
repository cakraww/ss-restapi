const _ = require('lodash')

module.exports = (knex) => {
  const ProductRepository = {}

  function getProductSizesByProductIds(productIds) {
    return knex('product_sizes')
      .select('product_id', 'size')
      .whereIn('product_id', productIds)
      .then(productSizes => {
        const psm = _.groupBy(productSizes, productSize => productSize.product_id)
        return _.mapValues(psm, pss => pss.map(pss => pss.size))
      })
  }

  ProductRepository.getProducts = () => {
    return knex('products').select('*')
      .then(products => {
        const ids = products.map(product => product.id)
        return getProductSizesByProductIds(ids)
          .then(productSizesMap => {
            const init = ids.reduce((acc, id) => {
              acc[id] = []
              return acc
            }, {})

            const productSizeMapping = _.merge(init, productSizesMap)
            return productSizeMapping
          })
          .then(productSizeMapping => products.map(product =>
            _.merge(product, {sizes: productSizeMapping[product.id],})
          ))
      })
  }

  ProductRepository.getProduct = (id) => {
    return knex('products').select('*')
      .where({id,})
      .limit(1)
      .then(([product,]) => product)
  }

  ProductRepository.SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',]

  function insertProductSizes(id, sizes) {
    const productSizes = sizes.map(size => ({
      product_id: id, size,
    }))

    if (!_.every(productSizes, productSize => _.includes(ProductRepository.SIZES, productSize.size)))
      return Promise.reject('Invalid size specified')
    else
      return knex.batchInsert('product_sizes', productSizes)
  }

  ProductRepository.createProduct = (name, price, sizes) => {
    return knex('products').insert({name, price,})
      .returning('id')
      .then(([id,]) => {
        return insertProductSizes(id, sizes).then(() => id)
      })
      .then(id => ProductRepository.getProduct(id))
  }

  ProductRepository.deleteProduct = (id) => {
    return knex('products').where({id,})
      .limit(1)
      .del()
  }

  return ProductRepository
}
