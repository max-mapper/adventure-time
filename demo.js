var adventureTime = require('./')

adventureTime({
  guide: "http://maxogden.github.io/try-dat/guide",
  server: "try-dat.com",
  id: Math.random().toString(36).slice(2)
})