var app = {
  elements: {
    photo: document.querySelector('#imageWrap'),
    createRoomForm: document.forms["createRoomForm"],
    guessForm: document.forms["guessForm"],
    nameForm: document.forms["nameForm"]
  },
  init: function () {
    connect.init()
    this.handleEvents()
  },
  handleEvents: function () {
    if(this.elements.nameForm) {
      this.elements.nameForm.addEventListener('submit', function(e) {
        e.preventDefault()
        connect.socket.emit('name', this["name"].value)
      })
    }
    if (this.elements.guessForm) {
      this.elements.guessForm.addEventListener('submit', function (e) {
        e.preventDefault()
        connect.socket.emit('guess', this["guess"].value)
      })
    }
    if (this.elements.createRoomForm) {
      this.elements.createRoomForm.addEventListener('submit', function (e) {
        e.preventDefault()
        connect.socket.emit('create', this["name"].value)
      })
    }
  }
}
var connect = {
  socket: io(),
  init: function () {
    this.handleEvents()
  },
  handleEvents: function () {
    if (app.elements.guessForm) {
      this.socket.on('photo', function (photo) {
        helper.replaceHTML(app.elements.photo, '<img src="' + photo + '">')
      })
    }
    if (app.elements.createRoomForm) {
      this.socket.on('create', function (result) {
        if (!result) {
          console.log(result)
          helper.replaceHTML(app.elements.createRoomForm["result"], 'Sorry, this name is already taken')
        } else {
          console.log('<a href="room/' + result + '>Play now</a>')
          helper.replaceHTML(app.elements.createRoomForm["result"], '<a href="room/?room=' + result + '">Play now</a>')
        }
      })
    }
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