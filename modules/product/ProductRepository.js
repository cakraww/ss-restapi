const _ = require('lodash')
const ResourceNotFound = require('../../errors/ResourceNotFound')
const {groupingByAndMap, toMapDefaultValue,} = require('../../util')

function insertProductSizes(trx, id, sizes) {
  const productSizes = sizes.map(size => ({product_id: id, size,}))
  return trx.batchInsert('product_sizes', productSizes)
}

function insertProductColors(trx, id, colors) {
  const productColors = colors.map(color => ({product_id: id, color,}))
  return trx.batchInsert('product_colors', productColors)
}

module.exports = (knex) => {
  const ProductRepository = {}

  function getProductSizesMapByProductIds(productIds) {
    return knex('product_sizes')
      .select('product_id', 'size')
      .whereIn('product_id', productIds)
      .then(productSizes => {
        const nonzeromap = groupingByAndMap(productSizes, ps => ps.product_id, ps => ps.size)
        const zeromap = toMapDefaultValue(productIds, [])
        return _.merge(nonzeromap, zeromap)
      })
  }

  function getProductColorsMapByProductIds(productIds) {
    return knex('product_colors')
      .select('product_id', 'color')
      .whereIn('product_id', productIds)
      .then(productColors => {
        const nonzeromap = groupingByAndMap(productColors, pc => pc.product_id, pc => pc.color)
        const zeromap = toMapDefaultValue(productIds, [])
        return _.merge(nonzeromap, zeromap)
      })
  }

  ProductRepository.getProducts = (sizes, colors, priceMin, priceMax) => {
    let query = knex('products as p')
      .leftJoin('categories as c', 'p.category_id', 'c.id')
      .select('p.id', 'p.name', 'p.price', 'c.name as category')
      .distinct('p.id')

    if (sizes.length > 0)
      query = query.leftJoin('product_sizes as ps', 'p.id', 'ps.product_id')
        .whereIn('ps.size', sizes)

    if (colors.length > 0)
      query = query.leftJoin('product_colors as pc', 'p.id', 'pc.product_id')
        .whereIn('pc.color', colors)

    if (priceMin !== null) query = query.where('p.price', '>=', priceMin)
    if (priceMax !== null) query = query.where('p.price', '<=', priceMax)

    let products = []
    let sizesMap = {}
    let colorsMap = {}
    return query.then(_products => {
      products = _products
      return products.map(product => product.id)
    })
    .then(ids => getProductSizesMapByProductIds(ids)
      .then(_sizesMap => sizesMap = _sizesMap)
      .then(() => ids)
    )
    .then(ids => getProductColorsMapByProductIds(ids)
      .then(_colorsMap => colorsMap = _colorsMap)
    )
    .then(() => products.map(product =>
      _.merge(product, {
        colors: colorsMap[product.id],
        sizes: sizesMap[product.id],
      })
    ))
  }

  function getProductSizesByProductId(productId) {
    return knex('product_sizes').select('size').where({product_id: productId,})
      .then(sizes => sizes.map(size => size.size))
  }

  function getProductColorsByProductId(productId) {
    return knex('product_colors').select('color').where({product_id: productId,})
      .then(colors => colors.map(color => color.color))
  }

  ProductRepository.getProduct = (id) => {
    return knex('products as p').leftJoin('categories as c', 'p.category_id', 'c.id')
      .select('p.id', 'p.name', 'p.name', 'c.name as category')
      .where('p.id', id)
      .limit(1)
      .then(([product,]) => {
        if (!product) return Promise.reject(new ResourceNotFound(`Product with id ${id} is not found`))
        return product
      })
      .then(product => getProductSizesByProductId(product.id)
        .then(sizes => _.merge(product, {sizes,}))
      )
      .then(product => getProductColorsByProductId(product.id)
        .then(colors => _.merge(product, {colors,}))
      )
  }

  ProductRepository.createProduct = (name, price, sizes, colors, categoryId) => {
    return knex.transaction(trx =>
      trx('products').insert({name, price, category_id: categoryId,})
        .returning('id')
        .then(([id,]) => id)
        .then(id => insertProductSizes(trx, id, sizes).then(() => id))
        .then(id => insertProductColors(trx, id, colors).then(() => id))
    )
      .then(id => ProductRepository.getProduct(id))
  }

  ProductRepository.deleteProduct = (id) => {
    return knex('products').where({id,})
      .limit(1)
      .del()
  }

  return ProductRepository
}
