const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const _ = require('lodash')

module.exports = (productRouter, categoryRouter) => {
  const app = express()

  app.use(logger('dev'))
  app.use(bodyParser.urlencoded({extended: true,}))
  app.use(expressValidator({
    customValidators: {
      isSubset:(param, superset) => _.intersection(superset, param).length > 0,
    },
  }))

  app.use('/products/', productRouter)
  app.use('/categories/', categoryRouter)

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
  })

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res) {
      res.status(err.status || 500)
      res.render('error', {
        message: err.message,
        error: err,
      })
    })
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: {},
    })
  })

  return app
}
