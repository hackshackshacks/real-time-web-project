var app = {
  elements: {
    photo: document.querySelector('#imageWrap'),
    time: document.querySelector('#time'),
    tags: document.querySelector('#tags'),
    guessForm: document.forms["guessForm"],
    nameForm: document.forms["nameForm"]
  },
  init: function () {
    connect.init()
    this.handleEvents()
  },
  handleEvents: function () {
    this.elements.nameForm.addEventListener('submit', function(e) {
      e.preventDefault()
      connect.socket.emit('name', this["name"].value)
    })
    this.elements.guessForm.addEventListener('submit', function (e) {
      e.preventDefault()
      connect.socket.emit('guess', this["guess"].value)
    })
  }
}
var connect = {
  socket: io(),
  init: function () {
    this.handleEvents()
  },
  handleEvents: function () {
    this.socket.on('photo', function (photo) {
      helper.replaceHTML(app.elements.photo, '<img src="' + photo + '">')
    })
    this.socket.on('time', function (time) {
      helper.replaceHTML(app.elements.time, time)
    })
    this.socket.on('tags', function (tags) {
      var list = '<ul>'
      tags.forEach(function (tag) {
        list += ('<li>' + tag + '</li>')
      })
      list += '</ul>'
      helper.replaceHTML(app.elements.tags, list)
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