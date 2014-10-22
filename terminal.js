var url = require('url')
var Terminal = require('term.js')
var docker = require('docker-browser-console')
var websocket = require('websocket-stream')

var consoleDiv = document.querySelector('.console')

var qs = url.parse(window.location.href, true).query
var socket = websocket('ws://'+qs.server+'/'+(qs.id || ''))
var container = docker({style:false})
socket.pipe(container).pipe(socket)
container.appendTo(consoleDiv)

var onoutput = function(data) {
  if (data.indexOf('\n') === -1) return
  window.parent.postMessage('update', '*')
}

container.on('stdout', onoutput)
container.on('stderr', onoutput)

container.once('stdout', function() {
  window.parent.postMessage('ready', '*')
})