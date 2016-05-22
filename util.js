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
    res.status(400).json({message: `Validation error: ${util.inspect(err)}`,})
  else if (err instanceof ResourceNotFound)
    res.status(404).json({message: err.message,})
  else if (err instanceof DuplicateData || err instanceof CannotDeleteResource)
    res.status(409).json({message: err.message,})
  else
    res.status(500).json({message: 'Internal server error',})
}
