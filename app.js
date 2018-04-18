const express = require('express')
const app = express()
const fetch = require('node-fetch')
const http = require('http').Server(app)
const io = require('socket.io')(http)
const nunjucks = require('nunjucks')
const compression = require('compression')

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
    this.setPhoto()
  },
  setPhoto: function () {
    io.emit('photo', 'https://farm1.staticflickr.com/906/40805823094_d049bb4c81.jpg')
    // api.getPhoto()
  }
}
const api = {
  getPhoto: function() {
    this.random = helper.randomize(1, 50)
    fetch(
      `https://api.flickr.com/services/rest/?method=flickr.interestingness.getList&api_key=1ebc0f19751593518831a641597b0b54&per_page=1&page=1&format=json&nojsoncallback=1&auth_token=72157667912956018-91e4c43c5e872beb&api_sig=d4000a3ab20861b3e61fbeba93dbe835`
    )
      .then(response => {
        return response.json()
      })
      .then(data => {
        game.currentPhoto = api.generateUrl(data.photos.photo[0])
      })
      .then(() => {
        console.log(game.currentPhoto)
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
  game.players.push(socket.id)
  game.setPhoto()
  socket.on('create', function (name) {
    console.log(socket.rooms)
    if (!socket.rooms.name) {
      socket.join(name)
      socket.emit('create', name)
    } else {
      socket.emit('create', false)
    }
    console.log('current rooms: ', socket.rooms)
  })
  socket.on('join', function (name) {
    if (socket.rooms.name) {
      socket.join(name)
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
