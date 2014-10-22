var xhr = require('xhr')
var treeView = require('tree-view')
var edit = require('edit')
var defaultcss = require('insert-css')
var url = require('url')
var querystring = require('querystring')
var iframe = require('iframe')

var production = !location.port // a bit hackish but assume production if no custom port

module.exports = function(opts) {
  if (!opts) opts = {}
  
  var guideURL = opts.guide || 'http://maxogden.github.io/get-dat'
  var consoleURL = opts.console || 'terminal.html'
  
  var editorDiv = document.querySelector('.editor')
  var treeDiv = document.querySelector('.tree')
  var guideDiv = document.querySelector('.guide')
  var consoleDiv = document.querySelector('.console')
  
  var qs = url.parse(window.location.href, true).query

  if (!qs.server) qs.server = production ? 'try-dat.com' : 'dev.try-dat.com:8080'
  if (!qs.id) qs.id = Math.random().toString(36).slice(2)

  consoleURL += '?'+querystring.stringify(qs)
  
  var guideFrame = iframe({src: guideURL, container: guideDiv})
  var consoleFrame = iframe({src: consoleURL, container: consoleDiv})
  
  // instantiate the editor
  var cm = edit({
    container: editorDiv,
    autofocus: false
  })
  
  var tree = treeView()
  tree.appendTo(treeDiv)
  
  var readdir = function(path, cb) {
    xhr({
      method: 'GET',
      url: 'http://'+qs.server+'/files/'+qs.id+path,
      json: true
    }, function(err, response) {
      if (err) return cb(err)
      cb(null, response.body)
    })
  }

  var cd = function(path) {
    readdir(path, function(err, files) {
      if (err) return onerror(err)
      tree.directory(path, files)
    })
  }

  var updateTree = throttle(1000, function(cb) {
    var dirs = Object.keys(tree.directories)

    dirs.forEach(function(path) {
      readdir(path, function(err, files) {
        if (err) return onerror(err)
        if (tree.directories[path]) tree.directory(path, files)
      })
    })

    cb()
  })

  var filename = null
  var save = throttle(1000, function(cb) {
    if (!filename) return cb()
    xhr({
      method: 'PUT',
      url: 'http://'+qs.server+'/files/'+qs.id+encodeURI(filename),
      body: cm.getValue()
    }, cb)
  })

  // autosave for now
  cm.on('change', save)

  var onmessage = function(e) {
    if (e.data === 'ready') return cd('/')
    if (e.data === 'update') return updateTree()
  }

  tree.on('directory', cd)
  tree.on('file', function(path) {
    xhr({
      method: 'GET',
      url: 'http://'+qs.server+'/files/'+qs.id+path
    }, function(err, response) {
      if (err) return onerror(err)
      filename = path
      cm.setValue(response.responseText)
      cm.focus()
    })
  })

  window.addEventListener('message', onmessage, false)
}

function throttle(wait, fn) { // todo: ask @maxogden to find/create a module that does this
  var blocked = false
  var called = false

  return function wrap() {
    if (blocked) {
      called = true
      return
    }

    blocked = true
    called = false
    fn(function() {
      setTimeout(function() {
        blocked = false
        if (called) wrap()
      }, wait)
    })
  }
}

function onerror(err) {
  console.error('Error:', err)
}