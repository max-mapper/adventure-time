var treeView = require('tree-view')
var edit = require('edit')
var defaultcss = require('insert-css')

module.exports = function() {  
  var editorDiv = document.querySelector('.editor')
  var treeDiv = document.querySelector('.tree')
    
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
