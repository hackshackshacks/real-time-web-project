# Imageguess
Imageguess is an online multiplayer game. The website shows an image and the goal is to guess what words the other players associate with this image. For example: Players might associate a picture of the beach with summer. If multiple players guess 'Summer' they will earn points based on the amount of other players with the same guess. A leaderboard tracks the scoreline. 

## Table of contents
- [Imageguess](#imageguess)
  * [Demo](#demo)
  * [Setup](#setup)
    + [Step 1](#step-1)
    + [Step 2](#step-2)
    + [Step 3](#step-3)
  * [Features](#features)
    + [Picture](#picture)
    + [Timer](#timer)
    + [Guessing](#guessing)
      - [During the game](#during-the-game)
      - [After the game](#after-the-game)
    + [Scoring](#scoring)
    + [Naming](#naming)
  * [External sources](#external-sources)
    + [Flickr](#flickr)
    + [Socket.io](#socketio)
  * [Data management](#data-management)
  * [Todo](#todo)

## Demo
[Link to demo](https://identify-me.herokuapp.com/)

![Showoff](https://github.com/hackshackshacks/real-time-web-project/blob/master/readme_images/home.png?raw=true)

## Setup
### Step 1
`git clone` the repository or simply download the files

### Step 2
Navigate to the repository in your terminal using `cd {project folder name}` and run `npm install` to install the project dependencies.

### Step 3
After installing the dependencies run `npm start` and navigate to http://localhost:5000/

## Features
### Picture
The project loads a random picture using the Flickr api mentioned below.

![Flickr images](https://github.com/hackshackshacks/real-time-web-project/blob/master/readme_images/images.png?raw=true)

### Timer
Every second the server emits the current gametimer. The clients render this timer. At the end of the timer the game ends and the score is calculated (see below).

![Guess](https://github.com/hackshackshacks/real-time-web-project/blob/master/readme_images/timer.png?raw=true)

### Guessing
The user can emit a guess using the input field as shown below. The server checks the guess for validity and filters duplicates.

#### During the game
![guesses](https://github.com/hackshackshacks/real-time-web-project/blob/master/readme_images/guesses.png?raw=true)

![Guess](https://github.com/hackshackshacks/real-time-web-project/blob/master/readme_images/home.png?raw=true)

#### After the game
At the end of the game the server returns all guessed tags. This way the user can see the guesses of himself and other players.

![Guess](https://github.com/hackshackshacks/real-time-web-project/blob/master/readme_images/allguesses.png?raw=true)

### Scoring
At the end of the game players gain points based on the guesses emitted by all players. The guesses of each user are compared to the complete array of guesses. The server then return the update score and the client renders it.

![Score](https://github.com/hackshackshacks/real-time-web-project/blob/master/readme_images/score.png?raw=true)

### Naming
The user can change his name by clicking on it. It will instantly update for all other users.

![Naming](https://github.com/hackshackshacks/real-time-web-project/blob/master/readme_images/name.png?raw=true) 

## External sources
### Flickr
This project uses the [Flickr api](https://www.flickr.com/services/api/) to retrieve random pictures. Specifically the [interestingness](https://www.flickr.com/services/api/flickr.interestingness.getList.html) list.

For every new game it retrieves a single image based on a randomly generated number.

### Socket.io
To enable realtime functionality this project used the [socket.io](https://socket.io/) library. This 

## Data management
Because the used data doesn't require to be remembered longer than the game time of 30-60 seconds, all of the data is stored in memory. When the game ends the data is thrown away.

It's looks something like this:

[data model](https://github.com/hackshackshacks/real-time-web-project/blob/master/readme_images/data.png?raw=true)

## Todo
* Creating and joining a room
