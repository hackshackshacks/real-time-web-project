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
  allGuesses: [],
  duration: 60,
  time: 60,
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
    io.emit('time', game.time)
    game.score()
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
  },
  score: function () {
    game.players.forEach((player) => {
      player.guesses.forEach((guess) => {
        game.allGuesses.forEach((allGuess) => {
          if (allGuess === guess) {
            player.score++
          }
        })
      })
      if ((player.score - player.guesses.length) >= 0) {
        player.score = player.score - player.guesses.length
      }
    })
    io.emit('players', game.players)
  }
}
const api = {
  getPhoto: function() {
    this.random = helper.randomize(1, 500)
    Flickr.tokenOnly(flickrOptions, function(error, flickr) {
      flickr.interestingness.getList({
        page: api.random,
        per_page: 1
      }, function(err, result) {
        game.currentPhoto = api.generateUrl(result.photos.photo[0])
        io.emit('photo', game.currentPhoto)
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
    guesses: [],
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
        game.players.forEach((player) => {
          if (player.id === socket.id) {
            player.guesses.push(guess)
            game.allGuesses.push(guess)
          }
        })
        io.emit('players', game.players)
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
