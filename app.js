const express = require('express')
const app = express()
const fetch = require('node-fetch')
const http = require('http').Server(app)
const io = require('socket.io')(http)
const nunjucks = require('nunjucks')
const compression = require('compression')
var Flickr = require("flickrapi"),
    flickrOptions = {
      api_key: "9d92a174005496d4546996d8d943d57a",
      secret: "fd0e411a39c26730"
    };

app.use(compression())
app.use(express.static(`${__dirname}/assets`))

nunjucks.configure('assets/views', {
  autoescape: true,
  express: app
})

const game = {
  currentPhoto: '',
  currentTags: ['bird', 'fly', 'redwing'],
  players: [],
  init: function() {
  }
}
const api = {
  getPhoto: function() {
    this.random = helper.randomize(1, 50)
    Flickr.tokenOnly(flickrOptions, function(error, flickr) {
      flickr.interestingness.getList({
        page: api.random,
        per_page: 1
      }, function(err, result) {
        io.emit('photo', api.generateUrl(result.photos.photo[0]))
      })
    })
  },
  generateUrl: function (photo) {
    return `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`
  }
}

const helper = {
  randomize: function(min, max) {
    return Math.floor(Math.random() * max + min)
  },
  checkArray: function (arr, value) { // check if value is in array
    let hasValue = false
    arr.forEach((item, i) => {
      if (arr[i] === value) {
        hasValue = true
      }
    })
    return hasValue
  }
}
app.get('/', (req, res) => {
  res.render('index.html')
})
app.get('/room', (req, res) => {
  res.render('room.html')
})

io.on('connection', function (socket) {
  console.log('user enter')
  api.getPhoto()
  game.players.push(socket.id)
  socket.on('create', function (name) {
    console.log(socket.rooms)
    if (!socket.rooms.name) {
      socket.join(name)
      socket.emit('create', name)
      socket.to(name).emit(api.getPhoto())
    } else {
      socket.emit('create', false)
    }
    console.log('current rooms: ', socket.rooms)
  })
  socket.on('join', function (name) {
    if (socket.rooms.name) {
      socket.join(name)
      console.log(socket)
    }
  })
  socket.on('name', function (name) {
    socket.username = name
    console.log(socket.username, 'iets')
  })
  socket.on('guess', function (guess) {
    console.log(helper.checkArray(game.currentTags, guess.toLowerCase()))
  })
  socket.on('disconnect', function () {
    console.log('user leave')
  })
})

http.listen(process.env.PORT || 5000, () => {
  console.log('Listening.. port 5000')
})

game.init()
