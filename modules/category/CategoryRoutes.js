const {jsonErrorHandler,} = require('../../util')

module.exports = (CategoryManager) => {
  const router = require('express').Router()

  router.get('/', (req, res) => {
    CategoryManager.getCategories()
      .then(categories => res.json(categories))
      .catch(err => jsonErrorHandler(res, err))
  })

  router.get('/:id', (req, res) => {
    req.checkParams('id', 'id must be an integer').isInt()
    req.asyncValidationErrors()
      .then(() => {
        const {id,} = req.params
        return CategoryManager.getCategory(id)
          .then(category => res.json(category))
      })
      .catch(err => jsonErrorHandler(res, err))
  })

  router.post('/', (req, res) => {
    req.checkBody('name', 'name is required').notEmpty()
    req.checkBody('parentId', 'parentId must be an integer').optional().isInt()

    req.asyncValidationErrors()
      .then(() => {
        const {name,} = req.body
        const parentId = req.body.parentId || null
        return CategoryManager.createCategory(name, parentId)
          .then(category => res.json(category))
      })
      .catch(err => jsonErrorHandler(res, err))
  })

  router.delete('/:id', (req, res) => {
    req.checkParams('id', 'id must be an integer').isInt()
    req.asyncValidationErrors()
      .then(() => {
        const {id,} = req.params
        return CategoryManager.deleteCategory(id)
          .then(deleted => res.json(deleted))
      })
      .catch(err => jsonErrorHandler(res, err))
  })

  return router
}
