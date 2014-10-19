var Terminal = require('term.js')
var websocket = require('websocket-stream')
var treeView = require('tree-view')
var edit = require('edit')
var flatui = require('flatui')
var defaultcss = require('defaultcss')

module.exports = function() {  
  var editorDiv = document.querySelector('.editor')
  var treeDiv = document.querySelector('.tree')
  var terminalDiv = document.querySelector('.tree')
  
  var socket = websocket('ws://localhost:10000')
  var term = newTerminal(socket, terminalDiv)
  
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

function newTerminal(socket, container) {
  var term = new Terminal({
    cols: 80,
    rows: 40,
    screenKeys: true
  })

  term.on('data', function(data) {
    socket.write(data)
  })

  term.on('title', function(title) {
    document.title = title
  })

  term.open(container)

  socket.on('data', function(data) {
    data = data.toString().replace(/\n/g, '\r\n')
    term.write(data)
  })

  socket.on('end', function() {
    term.destroy()
  })
  
  socket.on('error', function(e) {
    console.error(e.message)
  })
  
  return term
}


