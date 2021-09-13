/* eslint-disable no-use-before-define */
const registeredUsers = new Set();

module.exports = function (io) {
  io.on('connection', (socket) => {

    socket.on("login", (data) => {
      const { username } = data;

      if (username == null || username == "" || typeof username != "string") {
        return socket.emit("pop", { type: "error", message: "Please, specify an username." });
      }

      if (username.length > 16) {
        return socket.emit("pop", { type: "error", message: "Username too long. (" + username.length + " of max 16)" });
      }

      if (username.length < 3) {
        return socket.emit("pop", { type: "error", message: "Username too short. (" + username.length + " of min 3)" });
      }
      if (isUsernameRegistered(username)) {
        return socket.emit("pop", { type: "error", message: "Username already logged." });
      }

      registerUser(username, socket);
      socket.emit("login");
    });

    socket.on("error", () => {
      unregisterUser(socket);
    })

    socket.on("disconnect", () => {
      unregisterUser(socket);
    });

    socket.on("chat", (packet) => {
      const msg = packet.message;
      if (msg == null || msg == "") {
        return;
      }

      chat(socket, packet.message);
    })
  });
}

var broadcast = (message) => {
  for (const user of registeredUsers) {
    user.socket.emit("broadcast", { message });
  }
}

var chat = (socketEmitter, message) =>{
  for (const user of registeredUsers) {
    if (user.socket == socketEmitter) {
      const username = user.username;
      for (const reg of registeredUsers) {
        reg.socket.emit("chat", { username: username, message });
      }
    }
  }
}

var isUsernameRegistered = (username) => {
  for (const user of registeredUsers) {
    if (user.username.toLowerCase() == username.toLowerCase()) {
      return true;
    }
  }

  return false;
}

var registerUser = (username, socket) => {
  registeredUsers.add({
    username, socket
  });

  broadcast("User " + username + " join to the chat.");
}

var unregisterUser = (socket) => {
  for (const user of registeredUsers) {
    if (user.socket == socket) {
      registeredUsers.delete(user);
      broadcast("User " + user.username + " left the chat.");
    }
  }
}