const express = require('express')
const multiparty = require('multiparty')
const fs = require('fs')
const path = require('path')
const router = express.Router()

/* GET home page. */
router.get('*', function (req, res, next) {
  const p = path.join(process.cwd(), req.path)
  if (fs.statSync(p).isDirectory()) {
    const dirs = fs.readdirSync(p)
    res.render('index',
      {
        title: 'Simple file manager on ' + p,
        dirs,
        base: req.path.replace(/\/$/, '') + '/'
      })
  } else {
    res.set('content-type', 'application/octet-stream')
    res.sendFile(p)
  }
})

router.post('*', function (req, res, next) {
  const form = new multiparty.Form()

// Errors may be emitted
// Note that if you are listening to 'part' events, the same error may be
// emitted from the `form` and the `part`.
  form.on('error', function (err) {
    console.log('Error parsing form: ' + err.stack)
  })

// Parts are emitted when parsing the form
  form.on('part', function (part) {
    // You *must* act on the part by reading it
    // NOTE: if you want to ignore it, just call "part.resume()"

    if (!part.filename) {
      // filename is not defined when this is a field and not a file
      console.log('got field named ' + part.name)
      // ignore field's content
      part.resume()
    }

    if (part.filename) {
      // filename is defined when this is a file
      console.log('got file named ' + part.name)
      // ignore file's content here
      const ws = fs.createWriteStream(path.join(process.cwd(), req.path, part.filename))
      part.pipe(ws)
    }

    part.on('error', function (err) {
      // decide what to do
    })
  })
  form.on('close', function () {
    console.log('Upload completed!');
    res.redirect(req.path)
  })
  form.parse(req)
})

module.exports = router
