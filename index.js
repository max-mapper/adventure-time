var xhr = require('xhr')
var treeView = require('tree-view')
var edit = require('edit')
var defaultcss = require('insert-css')
var url = require('url')
var querystring = require('querystring')
var iframe = require('iframe')

module.exports = function(opts) {
  if (!opts) opts = {}
  
  var guideURL = opts.guide || 'http://maxogden.github.io/get-dat'
  var consoleURL = opts.console || 'terminal.html'
  
  var editorDiv = document.querySelector('.editor')
  var treeDiv = document.querySelector('.tree')
  var guideDiv = document.querySelector('.guide')
  var consoleDiv = document.querySelector('.console')
  
  var qs = url.parse(window.location.href, true).query

  if (!qs.server) qs.server = 'dev.try-dat.com:8080'
  if (!qs.id) qs.id = Math.random().toString(36).slice(2)

  consoleURL += '?'+querystring.stringify(qs)
  
  var guideFrame = iframe({src: guideURL, container: guideDiv})
  var consoleFrame = iframe({src: consoleURL, container: consoleDiv})
  
  // instantiate the editor
  edit({
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

  var onmessage = function(e) {
    if (e.data === 'ready') return cd('/')

    var dirs = Object.keys(tree.directories)
    dirs.forEach(function(path) {
      readdir(path, function(err, files) {
        if (err) return onerror(err)
        if (tree.directories[path]) tree.directory(path, files)
      })
    })
  }

  tree.on('directory', cd)
  window.addEventListener('message', onmessage, false)
}

function onerror(err) {
  console.error('Error:', err)
}