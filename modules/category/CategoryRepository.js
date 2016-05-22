const _ = require('lodash')
const ResourceNotFound = require('../../errors/ResourceNotFound')
const CannotDeleteResource = require('../../errors/CannotDeleteResource')
const DuplicateData = require('../../errors/DuplicateData')
const {groupingByAndMap, toMapDefaultValue,} = require('../../util')

module.exports = (knex) => {
  const CategoryRepository = {}

  function getCategoryChildrenByParentIds(parentIds) {
    return knex('categories as c').innerJoin('categories as cc', 'c.id', 'cc.parent_id')
      .select('c.id', 'cc.name as children')
      .whereIn('c.id', parentIds)
      .then(cChildren => {
        const nonzeromap = groupingByAndMap(cChildren, c => c.id, c => c.children)
        const zeromap = toMapDefaultValue(parentIds, [])
        return _.merge(nonzeromap, zeromap)
      })
  }

  CategoryRepository.getCategories = () => {
    let categories = []
    return knex('categories as c')
      .leftJoin('categories as pc', 'c.parent_id', 'pc.id')
      .select('c.id', 'c.name', 'pc.name as parent')
      .then(_categories => {
        categories = _categories
        return categories.map(c => c.id)
      })
      .then(ids => getCategoryChildrenByParentIds(ids))
      .then(cChildrenMap =>
        categories.map(c => _.merge(c, {children: cChildrenMap[c.id],}))
      )
  }

  function getCategoryChildren(id) {
    return knex('categories as c').innerJoin('categories as cc', 'c.id', 'cc.parent_id')
      .select('cc.name')
      .where('c.id', id)
      .then(categories => categories.map(c => c.name))
  }

  CategoryRepository.getCategory = (id) => {
    return knex('categories as c').leftJoin('categories as pc', 'c.parent_id', 'pc.id')
      .select('c.id', 'c.name', 'pc.name as parent')
      .where('c.id', id)
      .limit(1)
      .then(([category,]) => {
        if (!category) return Promise.reject(new ResourceNotFound(`Category with id ${id} is not found`))
        return category
      })
      .then(category => getCategoryChildren(category.id)
        .then(children => _.merge(category, {children,}))
      )
  }

  CategoryRepository.createCategory = (name, parentId) => {
    return knex.transaction(trx =>
      trx('categories').insert({name, parent_id: parentId,})
        .returning('id')
        .then(([id,]) => id)
    )
      .then(id => CategoryRepository.getCategory(id))
      .catch(err => {
        if (err.code == 23505) return Promise.reject(new DuplicateData(err.detail))
        else if (err.code == 23503) return Promise.reject(new ResourceNotFound(err.detail))
        else return Promise.reject(new Error(err))
      })
  }

  CategoryRepository.deleteCategory = (id) => {
    return knex('categories').where({id,})
      .limit(1)
      .del()
      .catch(err => {
        if (err.code == 23503) return Promise.reject(new CannotDeleteResource(err.detail))
        else return Promise.reject(new Error(err))
      })
  }

  return CategoryRepository
}
