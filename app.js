const express = require('express')
const app = express()
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
  players: [],
  duration: 30,
  gameTime: 30,
  active: true,
  init: function() {
    api.getPhoto()
    setInterval(function () {
      if (game.gameTime > 0) {
        game.gameTime--
        io.emit('gameTime', game.gameTime)
      } else if (game.gameTime === 0 && game.active) {
        game.active = false
        io.emit('tags', game.currentTags)
        io.emit('gameTime', game.gameTime)
        setTimeout(() => {
          game.active = true
          api.getPhoto()
          game.gameTime = game.duration
          io.emit('gameTime', game.gameTime)
        }, 5000)
      }
    }, 1000)
  }
}
const api = {
  getPhoto: function() {
    this.random = helper.randomize(1, 500)
    Flickr.tokenOnly(flickrOptions, function(error, flickr) {
      console.log(api.random)
      flickr.interestingness.getList({
        page: api.random,
        per_page: 1
      }, function(err, result) {
        game.currentPhoto = api.generateUrl(result.photos.photo[0])
        flickr.tags.getListPhoto({
          photo_id: result.photos.photo[0].id
        }, function(err, result) {
          io.emit('photo', game.currentPhoto)
          game.currentTags = result.photo.tags.tag.map((obj) => {
            var tag = obj.raw.toLowerCase()
            return tag
          })
        })
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

io.on('connection', function (socket) {
  console.log('user enter')
  socket.username = socket.id
  game.players.push(socket.username)
  socket.emit('photo', game.currentPhoto)
  socket.on('name', function (name) {
    var playerIndex = game.players.indexOf(socket.username)
    game.players[playerIndex] = name
    socket.username = name
    console.log('new username:', socket.username)
  })
  socket.on('guess', function (guess) {
    console.log('guess:', guess)
    console.log('guess in array:', helper.checkArray(game.currentTags, guess.toLowerCase()))
    console.log(game.currentTags)
    console.log(socket.username || socket.id)
    if (helper.checkArray(game.currentTags, guess.toLowerCase())) {
      io.emit('score', socket.username || socket.id)
    }
  })
  socket.on('disconnect', function () {
    var playerIndex = game.players.indexOf(socket.username)
    game.players.splice(playerIndex, 1)
    console.log('user leave', socket.username, game.players)
  })
})

http.listen(process.env.PORT || 5000, () => {
  console.log('Listening.. port 5000')
})

game.init()
