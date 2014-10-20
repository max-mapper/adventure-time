var Terminal = require('term.js')
var websocket = require('websocket-stream')
var treeView = require('tree-view')
var edit = require('edit')
var flatui = require('flatui')
var defaultcss = require('defaultcss')
var docker = require('docker-browser-console')

module.exports = function() {  
  var editorDiv = document.querySelector('.editor')
  var treeDiv = document.querySelector('.tree')
  var consoleDiv = document.querySelector('.console')
  
  var socket = websocket('ws://dev.try-dat.com:8080')
  var container = docker()
  socket.pipe(container).pipe(socket)
  container.appendTo(consoleDiv)
  
  // insert the flatui stylesheet into the DOM if it doesnt already exist on the page
  defaultcss('flatui', flatui)
  // instantiate the editor
  edit({container: editorDiv})
  
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
