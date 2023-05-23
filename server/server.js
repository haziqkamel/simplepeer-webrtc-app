const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const twilio = require("twilio");

const PORT = process.env.PORT || 5002;

const app = express();
const server = http.createServer(app);

app.use(cors());

let connectedUsers = [];
let rooms = [];

// Create Route to check if room exists
app.get("/api/room-exist/:roomId", (req, res) => {
  const { roomId } = req.params;
  const room = rooms.find((room) => room.id === roomId);

  if (room) {
    if (room.connectedUsers.length > 3) {
      return res.send({ roomExists: true, full: true });
    }
    return res.send({ roomExists: true, full: false });
  }
  return res.send({ roomExists: false });
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    method: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected ${socket.id}`);

  socket.on("create-new-room", (data) => {
    createNewRoomHandler(data, socket);
  });
});

//* Socket IO Handler
const createNewRoomHandler = (data, socket) => {
  const { identity } = data;
  // Generate Random RoomId
  const roomId = uuidv4();
  // Create New User
  const newUser = {
    identity,
    id: uuidv4(),
    socket: socket.id,
    roomId: roomId,
  };
  // Push that user to connectedUser
  connectedUsers = [...connectedUsers, newUser];
  // Create New Room
  const newRoom = {
    id: roomId,
    connectedUsers: [newUser],
  };
  // Join Socket IO room
  socket.join(roomId);
  rooms = [...rooms, newRoom];

  // emit to that client which created that room RoomId
  socket.emit("room-id", { roomId });

  // emit an event to all users connected to that room about new users which are inside the room
  socket.emit("room-update", { connectedUsers: newRoom.connectedUsers });
};

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
