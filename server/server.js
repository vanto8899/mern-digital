const express = require("express");
require("dotenv").config();
const dbConnect = require("./config/dbconnect");
const initRoutes = require("./routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express(); // Creates an Express application

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
); // Adds CORS middleware to the Express application

app.use(cookieParser()); // Adds cookie parsing middleware to the Express application

const port = process.env.PORT || 8888; // Sets the port for the server to listen on

app.use(express.json()); // Middleware to parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Middleware to parse incoming form data

// Connects to the database
dbConnect();

// Initializes routes by passing the Express app instance
initRoutes(app);

// Default route handler for "/"
app.use("/", (req, res) => {
  res.send("Hello World");
});

// Create HTTP server and integrate with Express app
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Starts the server and listens for incoming connections on the specified port
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`WebSocket server listening on port ${port}`);
});
