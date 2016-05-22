const _ = require('lodash')
const util = require('util')
const ResourceNotFound = require('./errors/ResourceNotFound')
const DuplicateData = require('./errors/DuplicateData')
const CannotDeleteResource = require('./errors/CannotDeleteResource')

module.exports.groupingByAndMap  = (collection, keyMapper, valueMapper) => {
  const mp = _.groupBy(collection, keyMapper)
  return _.mapValues(mp, c => c.map(valueMapper))
}

module.exports.toMapDefaultValue = (collection, defaultValue) => {
  return collection.reduce((acc, id) => {
    acc[id] = defaultValue
    return acc
  }, {})
}

module.exports.jsonErrorHandler = (res, err) => {
  console.log(err)
  if (Array.isArray(err))  // validation errors
    res.json({message: `Validation error: ${util.inspect(err)}`,}, 400)
  else if (err instanceof ResourceNotFound)
    res.json({message: err.message,}, 404)
  else if (err instanceof DuplicateData || err instanceof CannotDeleteResource)
    res.json({message: err.message,}, 409)
  else
    res.json({message: 'Internal server error',}, 500)
}
