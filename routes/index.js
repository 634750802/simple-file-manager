const express = require('express')
const multiparty = require('multiparty')
const fs = require('fs')
const path = require('path')
const router = express.Router()
const { getIconForFilename } = require('font-awesome-filetypes')
const filesize = require('filesize')
const moment = require('moment')

const base = process.cwd()


/* GET home page. */
router.get('*', function (req, res, next) {
  const p = path.join(base, decodeURIComponent(req.path))
  try {
    if (fs.statSync(p).isDirectory()) {
      const dirs = fs.readdirSync(p, { withFileTypes: true })
      res.render('index',
        {
          title: 'SFM',
          paths: p.split('/').reduce((parr, cv) => {
            const lastPath = parr[parr.length - 1]
            if (!lastPath) {
              return [
                {
                  name: '#',
                  path: '/',
                  valid: base === '/'
                }]
            }
            const currentPath = path.join(lastPath.path, cv)
            const realPath = path.relative(base, currentPath)
            return parr.concat({
              name: parr.length ? cv : '#',
              path: encodeURI(realPath),
              valid: !realPath.startsWith('..')
            })
          }, []),
          cwd: base,
          dirs: dirs
            .filter(a => {
              if (req.query.all !== 'true' && req.query.all !== '1') {
                if (a.name.startsWith('.')) {
                  return false
                }
              }
              return a.isFile() || a.isDirectory()
            })
            .sort((a, b) => {
              return b.isDirectory() - a.isDirectory() || (b.name.toLowerCase() > a.name.toLowerCase() ? -1 : 1)
            })
            .map(file => {
              const { size, mtime, birthtime } = fs.statSync(path.join(p, file.name))
              return {
                name: file.name,
                path: encodeURIComponent(file.name),
                icon: file.isDirectory() ? '<i class="fa fa-folder"></i>' : getIconForFilename(file.name),
                size: filesize(size),
                mtime: moment(mtime).format('YYYY-MM-DD HH:mm:ss'),
                birthtime: moment(birthtime).format('YYYY-MM-DD HH:mm:ss')
              }
            }),
          base: req.path.replace(/\/$/, '') + '/'
        })
    } else {
      res.set('content-type', 'application/octet-stream')
      res.sendFile(p)
    }
  } catch (e) {
    if (e.errno === -13) {
      res.sendStatus(401)
    } else if (e.errno === -2) {
      res.sendStatus(404)
    } else {
      console.error(e)
      res.sendStatus(500)
    }
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
    res.redirect(req.path)
  })
  form.parse(req)
})

router.delete('*', function (req, res, next) {
  const p = path.join(base, decodeURIComponent(req.path))
  const stat = fs.statSync(p)
  if (stat.isDirectory()) {
    fs.rmdirSync(p)
  } else if (stat.isFile()) {
    fs.unlinkSync(p)
  } else {
    res.sendStatus(500)
    return
  }
  res.sendStatus(204)
})

module.exports = router
