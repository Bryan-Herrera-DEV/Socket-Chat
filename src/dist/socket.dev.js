"use strict";

var registeredUsers = new Set();

module.exports = function (io) {
  io.on('connection', function (socket) {
    socket.on("login", function (data) {
      var username = data.username;

      if (username == null || username == "" || typeof username != "string") {
        return socket.emit("pop", {
          type: "error",
          message: "Please, specify an username."
        });
      }

      if (username.length > 16) {
        return socket.emit("pop", {
          type: "error",
          message: "Username too long. (" + username.length + " of max 16)"
        });
      }

      if (username.length < 3) {
        return socket.emit("pop", {
          type: "error",
          message: "Username too short. (" + username.length + " of min 3)"
        });
      }

      if (isUsernameRegistered(username)) {
        return socket.emit("pop", {
          type: "error",
          message: "Username already logged."
        });
      }

      registerUser(username, socket);
      socket.emit("login");
    });
    socket.on("error", function () {
      unregisterUser(socket);
    });
    socket.on("disconnect", function () {
      unregisterUser(socket);
    });
    socket.on("chat", function (packet) {
      var msg = packet.message;

      if (msg == null || msg == "") {
        return;
      }

      chat(socket, packet.message);
    });
  });
};

function broadcast(message) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = registeredUsers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var user = _step.value;
      user.socket.emit("broadcast", {
        message: message
      });
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

function chat(socketEmitter, message) {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = registeredUsers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var user = _step2.value;

      if (user.socket == socketEmitter) {
        var username = user.username;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = registeredUsers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var reg = _step3.value;
            reg.socket.emit("chat", {
              username: username,
              message: message
            });
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
              _iterator3["return"]();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
}

function isUsernameRegistered(username) {
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = registeredUsers[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var user = _step4.value;

      if (user.username.toLowerCase() == username.toLowerCase()) {
        return true;
      }
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
        _iterator4["return"]();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  return false;
}

function registerUser(username, socket) {
  registeredUsers.add({
    username: username,
    socket: socket
  });
  broadcast("User " + username + " join to the chat.");
}

function unregisterUser(socket) {
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = registeredUsers[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var user = _step5.value;

      if (user.socket == socket) {
        registeredUsers["delete"](user);
        broadcast("User " + user.username + " left the chat.");
      }
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
        _iterator5["return"]();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }
}