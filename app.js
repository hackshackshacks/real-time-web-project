const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const nunjucks = require('nunjucks')
const compression = require('compression')
var Flickr = require('flickrapi'),
  flickrOptions = {
    api_key: process.env.API_KEY,
    secret: process.env.SECRET
  }

app.use(compression())
app.use(express.static(`${__dirname}/assets/dist`))

nunjucks.configure('views', {
  autoescape: true,
  express: app
})

const game = {
  currentPhoto: '',
  players: [],
  allGuesses: [],
  duration: 30,
  time: 30,
  active: true,
  init: function() {
    api.getPhoto()
    game.start()
  },
  start: function() {
    io.emit('gameState', this.active)
    setInterval(() => {
      if (this.time > 0 && this.active) {
        this.time--
        io.emit('time', this.time)
      } else if (this.time === 0 && this.active) {
        this.end()
      }
    }, 1000)
  },
  end: function() {
    this.active = false
    io.emit('gameState', this.active)
    io.emit('time', this.time)
    this.score()
    setTimeout(() => {
      this.reset()
    }, 5000)
  },
  reset: function() {
    this.active = true
    this.allGuesses = []
    console.log(game.allGuesses, 'this:', this.allGuesses)
    io.emit('gameState', this.active)
    api.getPhoto()
    this.time = game.duration
    io.emit('time', this.time)
  },
  score: function() {
    // Compare player guess array to allGuesses array. Every time a player guess is found in the allGuesses array 1 point is added to player.score
    game.players.forEach(player => {
      console.log('guesses:', player.guesses)
      player.guesses.forEach(guess => {
        let count = helper.countArray(this.allGuesses, guess) - 1
        if (count < 0) {
          // prevent negative count
          count = 0
        }
        console.log(
          'all',
          this.allGuesses,
          'guess',
          guess,
          'score:',
          player.score,
          'count:',
          count
        )
        player.score = player.score + count
        player.guesses = []
      })
    })
    game.sortPlayers()
    io.emit('players', game.players)
  },
  sortPlayers: function() {
    game.players = game.players.sort((a, b) => {
      if (a.score > b.score) return -1
      if (a.score < b.score) return 1
      return 0
    })
  }
}
const api = {
  getPhoto: function() {
    this.random = helper.randomize(1, 500)
    Flickr.tokenOnly(flickrOptions, function(error, flickr) {
      flickr.interestingness.getList(
        {
          page: api.random,
          per_page: 1
        },
        function(err, result) {
          game.currentPhoto = api.generateUrl(result.photos.photo[0])
          io.emit('photo', game.currentPhoto)
        }
      )
    })
  },
  generateUrl: function(photo) {
    return `https://farm${photo.farm}.staticflickr.com/${photo.server}/${
      photo.id
    }_${photo.secret}.jpg`
  }
}

const helper = {
  randomize: function(min, max) {
    return Math.floor(Math.random() * max + min)
  },
  checkArray: function(arr, value) {
    // check if value is in array
    let hasValue = false
    arr.forEach((item, i) => {
      if (arr[i] === value) {
        hasValue = true
      }
    })
    return hasValue
  },
  countArray: function(array, value) {
    let count = 0
    array.forEach(item => {
      if (item === value) {
        count++
      }
    })
    return count
  }
}
app.get('/', (req, res) => {
  res.render('index.html')
})

io.on('connection', function(socket) {
  console.log('user enter')
  game.players.push({
    id: socket.id,
    username: socket.id,
    guesses: [],
    score: 0
  })
  socket.emit('photo', game.currentPhoto)
  io.emit('players', game.players)
  socket.on('name', function(name) {
    game.players.forEach(player => {
      if (player.id === socket.id) {
        player.username = name
      }
    })
    io.emit('players', game.players)
  })
  socket.on('guess', function(guess) {
    if (game.active) {
      game.players.forEach(player => {
        if (player.id === socket.id) {
          if (!player.guesses.includes(guess)) {
            console.log('guess:', guess, 'by: ', socket.id)
            socket.emit('newGuess', guess)
            player.guesses.push(guess)
            game.allGuesses.push(guess)
          }
        }
      })
    }
  })
  socket.on('disconnect', function() {
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
