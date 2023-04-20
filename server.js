//@sayon
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const app = express();
const { authSocket, socketServer } = require("./socketServer");
const posts = require("./routes/posts");
const users = require("./routes/users");
const comments = require("./routes/comments");
const messages = require("./routes/messages");
const PostLike = require("./models/PostLike");
const Post = require("./models/Post");

dotenv.config();

const httpServer = require("http").createServer(app);

//allow collection to a specific host
const io = require("socket.io")(httpServer, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

//adding the middleware authSocket function
io.use(authSocket);

//sets up the event listener for new WebSocket connections
io.on("connection", (socket) => socketServer(socket));

mongoose
  .connect("mongodb://0.0.0.0:27017/sayon_stories")
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => console.log(err));
  
  


httpServer.listen(process.env.PORT || 4000, () => {
  console.log("Listening");
});
app.get("/",(req,res)=>res.send("server listening"));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended:true}))
app.use("/api/posts", posts);
app.use("/api/users", users);
app.use("/api/comments", comments);
app.use("/api/messages", messages);

if (process.env.NODE_ENV == "production") {
  app.use(express.static(path.join(__dirname, "/client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}


