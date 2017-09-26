var url = require('url')
var docker = require('docker-browser-console')
var websocket = require('websocket-stream')
var termjs = require('term.js')
var rainbow = require('rainbow-load')

module.exports = function (parentDiv) {
  var consoleDiv = parentDiv || document.querySelector('.console')

  rainbow.show()

  var qs = url.parse(window.location.href, true).query
  var proto = 'ws://'
  if (qs.secure) proto = 'wss://'
  var socket = websocket(proto + qs.server + '/' + (qs.id || ''))

  termjs.Terminal.colors[256] = '#ffffff'
  termjs.Terminal.colors[257] = '#000000'

  var container = docker({
    style: false, renderer: termjs
  })

  socket.pipe(container).pipe(socket)
  container.appendTo(consoleDiv)

  socket.on('error', function(err) {
    rainbow.hide()
    container.terminal.write('WebSocket connection error. Open DevTools for more information.')
    window.parent.postMessage('connectionError', '*')
  })

  var onoutput = function(data) {
    if (data.indexOf('\n') === -1) return
    window.parent.postMessage('update', '*')
  }

  container.on('stdout', onoutput)
  container.on('stderr', onoutput)

  container.once('stdout', function() {
    rainbow.hide()
    window.parent.postMessage('ready', '*')
  })

  window.onfocus = function() {
    document.body.className = 'focus'
  }

  window.onblur = function() {
    document.body.className = 'blur'
  }
}
