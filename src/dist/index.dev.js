"use strict";

// Import of Libraries
express = require("express");
http = require("http");
morgan = require("morgan");
path = require("path");
socketio = require("socket.io");
socket = require("./socket"); // Objects

var app = express();
var server = http.Server(app);
var io = socketio(server); // Configuration

app.set("port", 7000);
app.set("host", "127.0.0.1"); // Engine settings

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Middlewares

app.use(express["static"](path.join(__dirname, "public")));
app.use(morgan("dev")); // Routes

app.all("*", function (req, res) {
  res.render("main");
}); // Prepare socket

socket(io); // Listener

server.listen(app.get("port"), app.get("host"), function () {
  console.log("App listening on http://".concat(app.get("host"), ":").concat(app.get("port"), "/"));
});