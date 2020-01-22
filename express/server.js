const express = require("express");
const app = express();
const http = require("http");
const socketIO = require("socket.io");
const port = 3001;
const BodyParser = require("body-parser");
const morgan = require("morgan");

// our server instance
const server = http.createServer(app);

// This creates our socket using the instance of the server
const io = socketIO(server);

app.use(BodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(morgan("dev"));

app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));
app.use("/assets", express.static(__dirname + "/assets"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});
io.origins("*:*");

const players = {};
const spawnPoints = [
  [96, 96, "white"],
  [96, 928, "blue"],
  [928, 96, "black"],
  [928, 928, "red"]
];

const spawnPlayer = (spawnPoints, socketID) => {
  let res;
  if (spawnPoints.length === 0) {
    nspPlayers.to(socketID).emit("lobbyFull", "Lobby Full");
  } else {
    res = players[socketID] = {
      spawnx: spawnPoints[0][0],
      spawny: spawnPoints[0][1],
      color: spawnPoints[0][2],
      playerId: socketID
    };
    nspPlayers.to(socketID).emit("changeColor", spawnPoints[0][2]);
    // update all other players of the new player
    nspGame.emit("newPlayer", players[socketID]);
    spawnPoints.shift();
  }

  return res;
};
//player namespace
const nspPlayers = io.of("/players");
nspPlayers.on("connection", function(socket) {
  // create a new player and add it to our players object
  spawnPlayer(spawnPoints, socket.id);

  socket.on("disconnect", () => {
    spawnPoints.push([players[socket.id]["spawnx"], players[socket.id]["spawny"], players[socket.id]["color"]]);
    // emit a message to all players to remove this player
    nspGame.emit("disconnect", players[socket.id]);
    delete players[socket.id];
  });

  nspGame.emit("allPlayers", players);

  const emitPlayerMove = data => {
    nspGame.emit("playerMovement", data);
  };
  socket.on("playerMovement", data => {
    emitPlayerMove(data);
  });
  socket.on("playerMovementEnd", data => {
    nspGame.emit("playerMovementEnd", data);
  });

  socket.on("dropBomb", data => {
    nspGame.emit("dropBomb", data);
  });
});

//game namespace
const nspGame = io.of("/game");
nspGame.on("connection", function(socket) {
  socket.on("playerDied", data => {
    nspGame.emit("removeClass", players[data]);
    nspPlayers.to(data).emit("playerDied", true);
  });
  socket.on("gameOver", data => {
    nspPlayers.to(data).emit("playerWin", true);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
