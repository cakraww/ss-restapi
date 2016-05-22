module.exports = (categoryRepo) => {
  const CategoryManager = {}

  CategoryManager.getCategory = (id) => {
    return categoryRepo.getCategory(id)
  }

  CategoryManager.getCategories = () => {
    return categoryRepo.getCategories()
  }

  CategoryManager.createCategory = (name, parentId = null) => {
    return categoryRepo.createCategory(name, parentId)
  }

  CategoryManager.deleteCategory = id => {
    return categoryRepo.deleteCategory(id)
  }

  return CategoryManager
}
