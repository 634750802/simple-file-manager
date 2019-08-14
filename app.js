const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const commander = require('commander')

const indexRouter = require('./routes/index')

const program = new commander.Command()
program.version(process.version)

program
  .option('-P --port <port>', 'running port Default to 3000', 3000)
  .option('-B --base-url <BaseUrl>', 'Base url, default to ""', '')

program.parse(process.argv)

process.env.PORT = program.port
process.env.BASE_URL = program.baseUrl

const app = express()
app.locals.baseUrl = program.baseUrl

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(indexRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
