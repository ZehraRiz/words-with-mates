const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("../utils/users.js");
const {
  gameJoin,
  setGamePlayer1,
  setGamePlayer2,
  getAllGames,
  playerDisconnectFromGame,
  removeGame,
  isPlayerInGame,
  findGame,
  getPlayerNumber
} = require("../utils/games.js");

const games = getAllGames();

module.exports.listen = function(io, socket){
  //client --> server --> clients (chat message from client)
 socket.on("username", (username) => {
    if (username === "") {
      //validation needs to be improved
      socket.emit("usernameError", "please enter a valid username");
    } else {
      const user = userJoin(socket.id, username);
      socket.join(user.room);
      socket.emit("usernameRegistered", {
        msg: "you are a registered player now",
        user: getCurrentUser(socket.id),
        allOnlineUsers: getRoomUsers(),
      });
        console.log(`${user.name} has joined the lobby`)
      socket.broadcast.to(user.room).emit("welcomeNewUser", { user: user });
    }
 });
    
     socket.on("sendMsg", ({  gameId, currentPlayer, newMessage }) => {
    const game = findGame(gameId);
      if (!game) { socket.emit("gameEnded", "The game has ended"); return; }
      const user = getCurrentUser(socket.id);
      if (!user) { socket.emit("opponentLeft", "The opponent has left the game"); return; }
      const msgObject = {
        playerFromBackend: currentPlayer,
        playerName: user.name,
        msg: newMessage,
        date: now.format("h:mm:ss a")
      }
      io.in(gameId).emit("recieveMsg", msgObject) //also return time here
    })

    
    
    
      //disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.in(user.room).emit("userLeft", {user});
      const game = playerDisconnectFromGame(user.id);
      if (game !== "") {
        socket.broadcast
          .to(game.gameId)
          .emit("playerLeft", `${user.name} has left the game`);
      } else {
        console.log("user was not in a game");
      }
    }
    console.log("A connection left");
  });

};