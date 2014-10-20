var treeView = require('tree-view')
var edit = require('edit')
var defaultcss = require('insert-css')
var url = require('url')
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
  var server = qs.server
  
  if (server) {
    consoleURL += '?server=' + server
  }
  
  var guideFrame = iframe({src: guideURL, container: guideDiv})
  var consoleFrame = iframe({src: consoleURL, container: consoleDiv})
  
  // instantiate the editor
  edit({
    container: editorDiv,
    autofocus: false
  })
  
  var tree = treeView()
  tree.appendTo(treeDiv)
  
  tree.directory('/', [{
    path: '/foo',
    type: 'directory'
  }, {
    path: '/bar',
    type: 'directory'
  }, {
    path: '/baz',
    type: 'file'
  }])
}
