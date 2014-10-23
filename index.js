var xhr = require('xhr')
var treeView = require('tree-view')
var edit = require('edit')
var defaultcss = require('insert-css')
var on = require('component-delegate').bind
var elementClass = require('element-class')
var iframe = require('iframe')

module.exports = function(opts) {
  if (!opts || !opts.guide || !opts.id || !opts.server) throw new Error('Must specify guide, server and id options')
  
  var editorDiv = document.querySelector('.editor')
  var treeDiv = document.querySelector('.tree')
  var guideDiv = document.querySelector('.guide')
  var consoleDiv = document.querySelector('.console')
  var defaultConsole = 'terminal.html?server=' + opts.server + '&id=' + opts.id
  var guideFrame = iframe({src: opts.guide, container: guideDiv})
  var consoleFrame = iframe({src: opts.console || defaultConsole, container: consoleDiv})
  
  var actions = {
    "show-bottom": function() {
      elementClass(editorDiv).remove('hidden')
      elementClass(treeDiv).remove('hidden')
      elementClass(consoleDiv).remove('tall')
      elementClass(guideDiv).remove('tall')
    },
    "hide-bottom": function() {
      elementClass(editorDiv).add('hidden')
      elementClass(treeDiv).add('hidden')
      elementClass(consoleDiv).add('tall')
      elementClass(guideDiv).add('tall')
    }
  }
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
      url: 'http://'+opts.server+'/files/'+opts.id+path,
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
      url: 'http://'+opts.server+'/files/'+opts.id+encodeURI(filename),
      body: cm.getValue()
    }, cb)
  })

  // autosave for now
  cm.on('change', save)

  var onmessage = function(e) {
    if (e.data === 'ready') return cd('/')
    if (e.data === 'update') return updateTree()
    // if (e.data === 'connectionError') // do stuff
  }

  tree.on('directory', cd)
  tree.on('file', function(path) {
    xhr({
      method: 'GET',
      url: 'http://'+opts.server+'/files/'+opts.id+path
    }, function(err, response) {
      if (err) return onerror(err)
      filename = path
      cm.setValue(response.responseText)
      cm.focus()
    })
  })
  
  on(document.body, '.buttons a', 'click', function(e) {
    e.preventDefault()
    var action = e.target.attributes['data-action']
    if (action) {
      if (actions[action.value]) actions[action.value]()
    }
    return false
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