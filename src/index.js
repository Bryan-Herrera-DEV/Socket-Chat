// Import of Libraries
express = require("express");
cors = require('cors');
http = require("http");
morgan = require("morgan");
path = require("path");
socketio = require("socket.io");
socket = require("./socket");

// Objects
const app = express();
app.use(cors())

const server = http.Server(app);
const io = socketio(server);

// Configuration
app.set("port", 3000);
app.set("host", "localhost");

// Engine settings
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));

// Routes
app.all("*", (req, res) => {
    res.render("main");
});

// Prepare socket
socket(io);

// Listener
server.listen(app.get("port"), app.get("host"), () => {
    console.log(`App listening on http://${app.get("host")}:${app.get("port")}/`);
});