const express = require("express");
const http = require("http");
const cors = require("cors");
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://ctrl-alt-elite-o5q5.vercel.app"
  ],
  credentials: true
}));

const mongoose = require("mongoose");
require("dotenv").config();

const socketServer = require("./socketServer");
const authRoutes = require("./routes/authRoutes");
const friendInvitationRoutes = require("./routes/friendInvitationRoutes");

const PORT = process.env.PORT || process.env.API_PORT;

const app = express();
app.use(express.json());

// app.use(cors({
//   origin:  "ctrl-alt-elite-o5q5.vercel.app", 
//   credentials: true
// }));

// register the routes
app.use("/api/auth", authRoutes);
app.use("/api/friend-invitation", friendInvitationRoutes);

const server = http.createServer(app);
socketServer.registerSocketServer(server);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is listening on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("database connection failed. Server not started");
    console.error(err);
  });
