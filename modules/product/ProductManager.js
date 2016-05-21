module.exports = (productRepo) => {
  const ProductManager = {}

  ProductManager.getProducts = () => {
    return productRepo.getProducts()
  }

  ProductManager.createProduct = (name, price, sizes = []) => {
    return productRepo.createProduct(name, price, sizes)
  }

  ProductManager.deleteProduct = id => {
    return productRepo.deleteProduct(id)
  }

  return ProductManager
}
