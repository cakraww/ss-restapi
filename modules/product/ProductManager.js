module.exports = (productRepo) => {
  const ProductManager = {}

  ProductManager.getProduct = (id) => {
    return productRepo.getProduct(id)
  }

  ProductManager.getProducts = (sizes = [], colors = [], priceMin = null, priceMax = null) => {
    return productRepo.getProducts(sizes, colors, priceMin, priceMax)
  }

  ProductManager.createProduct = (name, price, sizes = [], colors = []) => {
    return productRepo.createProduct(name, price, sizes, colors)
  }

  ProductManager.deleteProduct = id => {
    return productRepo.deleteProduct(id)
  }

  return ProductManager
}
