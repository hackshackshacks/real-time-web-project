const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const nunjucks = require('nunjucks')
const compression = require('compression')
var Flickr = require("flickrapi"),
    flickrOptions = {
      api_key: process.env.API_KEY,
      secret: process.env.SECRET
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
  duration: 10,
  time: 10,
  active: true,
  init: function() {
    api.getPhoto()
    game.start()
  },
  start: function () {
    io.emit('gameState', game.active)
    setInterval(function () {
      if (game.time > 0 && game.active) {
        game.time--
        io.emit('time', game.time)
      } else if (game.time === 0 && game.active) {
        game.end()        
      }
    }, 1000)
  },
  end: function () {
    game.active = false
    io.emit('gameState', game.active)
    io.emit('tags', game.currentTags)
    io.emit('time', game.time)
    setTimeout(() => {
      game.reset()
    }, 5000)
  },
  reset: function () {
    game.active = true
    io.emit('gameState', game.active)
    api.getPhoto()
    game.time = game.duration
    io.emit('time', game.time)
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
  game.players.push({
    id: socket.id,
    username: socket.id,
    score: 0
  })
  socket.emit('photo', game.currentPhoto)
  io.emit('players', game.players)
  socket.on('name', function (name) {
    game.players.forEach((player) => {
      if (player.id === socket.id) {
        player.username = name
      }
    })
    io.emit('players', game.players)
  })
  socket.on('guess', function (guess) {
    console.log('guess:', guess, 'by: ', socket.id)
    if (game.active) {
      if (helper.checkArray(game.currentTags, guess.toLowerCase())) {
        game.players.forEach((player) => {
          if (player.id === socket.id) {
            player.score = player.score + game.time
          }
        })
        io.emit('players', game.players)
        game.end()
      }
    }
  })
  socket.on('disconnect', function () {
    game.players.forEach((player, i) => {
      if (player.id === socket.id) {
        game.players.splice(i, 1)
      }
    })
    io.emit('players', game.players)
    console.log('user leave', socket.id, game.players)
  })
})

http.listen(process.env.PORT || 5000, () => {
  console.log('Listening.. port 5000')
})

game.init()
