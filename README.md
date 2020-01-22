# Ok, Boomer

## Main Page

!["Main Page"](https://github.com/umrude/ok-boomer/blob/master/react-front-end/src/screenshots/mainpage.gif?raw=true)

## Game Play

!["Game Play 1"](https://github.com/umrude/ok-boomer/blob/master/react-front-end/src/screenshots/gamePlay1.gif?raw=true)
!["Game Play 2"](https://github.com/umrude/ok-boomer/blob/master/react-front-end/src/screenshots/gamePlay2.gif?raw=true)
!["Game Play 3"](https://github.com/umrude/ok-boomer/blob/master/react-front-end/src/screenshots/gamePlay3.gif?raw=true)
!["Draw"](https://github.com/umrude/ok-boomer/blob/master/react-front-end/src/screenshots/draw.gif?raw=true)

## Reset Game

!["Reset"](https://github.com/umrude/ok-boomer/blob/master/react-front-end/src/screenshots/reset.gif?raw=true)

## Controller

!["Controller"](https://github.com/umrude/ok-boomer/blob/master/react-front-end/src/screenshots/controller.jpeg?raw=true)
!["Winner"](https://github.com/umrude/ok-boomer/blob/master/react-front-end/src/screenshots/winner.jpg?raw=true)
!["Loser"](https://github.com/umrude/ok-boomer/blob/master/react-front-end/src/screenshots/loser.jpeg?raw=true)

## Description

Ok, Boomer is a Phaser.js based multiplayer game (up to 4 players) with a React based controller via mobile devices.

The controllers will change colors relative to the character randomly selected for you on connection. A message will appear on your controller if you win or lose.

The goal of the game is to be the last one standing in a battle-royale style match.

## Running The Game

You need **TWO** terminal windows/tabs for this (or some other plan for running two Node processes).

In one terminal, `cd` into `react-front-end`. Be sure to change the IP address in `Default.js` to your public IP address here. Run `npm install` or `yarn` to install the dependencies, then run `npm start` or `yarn start`.

In the other terminal, `cd` into `express`. Be sure to change the IP address in `index.html` to your public IP address here as well. Run `npm install` or `yarn` to install the dependencies, then `npm start` or `yarn start` to launch the server. Head over to <http://localhost:3001/> to play!

To join the game, scan the QR code with your phone to generate your controller.

## Stack

- Node.js
- Express
- React JS
- Socket.io
- Phaser.js
- JQuery
- HTML5
- JavaScript
- CSS

## Dependencies

    "body-parser": "^1.18.3",
    "express": "^4.16.4",
    "morgan": "^1.9.1",
    "nodemon": "^1.18.7",
    "phaser-tiled-json-external-loader": "^0.1.0",
    "socket.io": "^2.3.0",
    "classnames": "^2.2.6",
    "nipplejs": "^0.8.4",
    "react": "^16.8.6",
    "react-dom": "^16.8.6",
    "react-nipple": "^1.0.1",
    "react-scripts": "2.1.8",
    "socket.io-client": "^2.3.0"

## Contributions

This app was created by...

- https://github.com/umrude
- https://github.com/Darrenni97
- https://github.com/SunnieBB
