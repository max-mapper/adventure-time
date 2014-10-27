# adventure-time

a web UI for doing nodeschool adventures in the browser

more instructions soon!

### run the demo

- install docker (docker for linux, boot2docker for mac/windows)
- install and run https://github.com/mafintosh/docker-browser-server
- install and run https://github.com/maxogden/adventure-time (the demo uses get-dat content but you can swap in your own)

### example

use with browserify

```JS
var adventureTime = require('adventure-time')

adventureTime({
  guide: "http://maxogden.github.io/get-dat/guide",
  server: "try-dat.com",
  id: Math.random().toString(36).slice(2)
})
```

see `demo.js`, `demo-terminal.js`, `index.html` and `terminal.html` for more details.