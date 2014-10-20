var url = require('url')
var Terminal = require('term.js')
var docker = require('docker-browser-console')
var websocket = require('websocket-stream')

var consoleDiv = document.querySelector('.console')

var qs = url.parse(window.location.href, true).query
var serverURL = qs.server || 'ws://dev.try-dat.com:8080'
var socket = websocket(serverURL)
var container = docker()
socket.pipe(container).pipe(socket)
container.appendTo(consoleDiv)
