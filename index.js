var treeView = require('tree-view')
var edit = require('edit')
var flatui = require('flatui')
var defaultcss = require('defaultcss')

module.exports = function() {
  var editorDiv = document.querySelector('.editor')
  var treeDiv = document.querySelector('.tree')
  // insert the flatui stylesheet into the DOM if it doesnt already exist on the page
  defaultcss(flatui)
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