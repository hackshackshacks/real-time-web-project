var app = {
  elements: {
    wrap: document.querySelector('#wrap'),
    photo: document.querySelector('#imageWrap'),
    time: document.querySelector('#time'),
    tags: document.querySelector('#tags'),
    players: document.querySelector('#players'),
    guessForm: document.forms["guessForm"],
    progress: document.querySelector('progress'),
    guesses: document.querySelector('.guesses'),
    popOver: document.querySelector('.pop-over'),
    startButton: document.querySelector('.pop-over button')
  },
  init: function () {
    connect.init()
    this.handleEvents()
  },
  handleEvents: function () {
    this.elements.guessForm.addEventListener('submit', function (e) {
      e.preventDefault()
      if (this["guess"].value) {
        connect.socket.emit("guess", this["guess"].value.toLowerCase())
        this["guess"].value = ''
      }
    })
    this.elements.startButton.addEventListener('click', () => {
      this.elements.popOver.classList.remove('start')
    })
  },
  disconnect: function () {
    this.elements.popOver.classList.add('offline')
    this.elements.popOver.classList.remove('start')
  },
  connect: function() {
    this.elements.popOver.classList.remove('offline')
  }
}
var connect = { // handle socket events
  socket: io(),
  init: function () {
    this.handleEvents()
  },
  handleEvents: function () {
    this.socket.on('photo', function (photo) {
      helper.replaceHTML(app.elements.photo, '<img src="' + photo + '">')
    })
    this.socket.on('time', function (time) {
      connect.currentTime = time
      app.elements.progress.value = time
      if (!navigator.onLine) {
        app.disconnect()
      } else {
        app.connect()
      }
      if (time < 6 && time > 0) {
        helper.replaceHTML(app.elements.time, time)
      } else if (time === 0) {
        helper.replaceHTML(app.elements.time, "Time's up!")
        helper.replaceHTML(app.elements.guesses, '')
      } else {
        helper.replaceHTML(app.elements.time, "")
      }
    })
    this.socket.on('players', function (players) {
      var list = ''
      players.forEach(function (player, i) {
        if (player.id === connect.socket.id) {
          list += (`<li class="active"><div class="player"><span contenteditable class="playerName">${player.username}</span><span>${player.score} points</span></div><div class="rank">#${i + 1}</div></li>`)
        } else {
          list += (`<li><div class="player"><span>${player.username}</span><span>${player.score} points</span></div><div class="rank">#${i + 1}</div></li>`)
        }
      })
      helper.replaceHTML(app.elements.players, list)
      let playerName = document.querySelector('.playerName')
      playerName.addEventListener('blur', function(e) {
        connect.socket.emit('name', playerName.innerText)
      })
    })
    this.socket.on('gameState', function (state) {
      if (state) {
        app.elements.wrap.dataset.active = true
        helper.emptyElement(app.elements.guesses)
      } else {
        app.elements.wrap.dataset.active = false
      }
    })
    this.socket.on('newGuess', (guess) => {
      app.elements.guesses.insertAdjacentHTML('beforeend', `<span>${guess}</span>`)
    })
    this.socket.on('allGuesses', (guesses) => {
      guesses.forEach((guess) => {
        app.elements.guesses.insertAdjacentHTML('beforeend', `<span class="all">${guess}</span>`)
      })
    })
    this.socket.on('reconnecting', (attemptNumber) => {
      app.disconnect()
    })
    this.socket.on('connect', function() {
      app.elements.popOver.classList.remove('offline')
    })
  }
}
var helper = {
  emptyElement: function (element) { // empty an html element
    while (element.firstChild) {
      element.removeChild(element.firstChild)
    }
  },
  replaceHTML: function (element, string) { // empty html and insert new value
    this.emptyElement(element)
    element.insertAdjacentHTML('beforeend', string)
  }
}

app.init()