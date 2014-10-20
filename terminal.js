var Terminal = require('term.js')
var docker = require('docker-browser-console')
var websocket = require('websocket-stream')

var consoleDiv = document.querySelector('.console')

var socket = websocket('ws://dev.try-dat.com:8080')
var container = docker()
socket.pipe(container).pipe(socket)
container.appendTo(consoleDiv)
