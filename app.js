const express = require('express')
const app = express()
const http = require('http').Server(app)
// const io = require('socket.io')(http)
const nunjucks = require('nunjucks')
const compression = require('compression')

app.use(compression())
app.use(express.static(`${__dirname}/assets`))

nunjucks.configure('assets/views', {
  autoescape: true,
  express: app
})

app.get('/', (req, res) => {
  res.render('index.html', {})
})

http.listen(process.env.PORT || 5000, () => {
  console.log('Listening.. port 5000')
})
