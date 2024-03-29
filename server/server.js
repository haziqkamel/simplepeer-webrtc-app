const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const twilio = require("twilio");
require("dotenv").config();

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

app.get("/api/get-turn-credentials", (req, res) => {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
    client.tokens.create().then((token) => {
      res.send({ token });
    });
  } catch (e) {
    console.log(
      `An error occured while fetching turn server credentials: ${e}`
    );
    res.send({ token: null });
  }
});

// MARK:- Socket IO Server
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    method: ["GET", "POST"],
  },
});

// Listen on "connection"
io.on("connection", (socket) => {
  console.log(`User connected ${socket.id}`);

  // Listen to on "create-new-room"
  socket.on("create-new-room", (data) => {
    createNewRoomHandler(data, socket);
  });

  socket.on("join-room", (data) => {
    joinRoomHandler(data, socket);
  });

  socket.on("disconnect", () => {
    disconnectHandler(socket);
  });

  socket.on("conn-signal", (data) => {
    signalingHandler(data, socket);
  });

  socket.on("conn-init", (data) => {
    initializeConnectionHandler(data, socket);
  });
});

//* Socket IO Handler
const createNewRoomHandler = (data, socket) => {
  const { identity, onlyAudio } = data;
  // Generate Random RoomId
  const roomId = uuidv4();
  console.log(roomId);
  // Create New User
  const newUser = {
    identity,
    id: uuidv4(),
    socketId: socket.id,
    roomId,
    onlyAudio,
  };
  console.log(newUser);
  // Push that user to connectedUser
  connectedUsers = [...connectedUsers, newUser];
  // Create New Room
  const newRoom = {
    id: roomId,
    connectedUsers: [newUser],
  };
  // Join Socket IO room
  socket.join(roomId);
  // Push newRoom to rooms
  rooms = [...rooms, newRoom];

  // Socket Emit "room-id"
  socket.emit("room-id", { roomId });

  // Socket Emit "room-update"
  socket.emit("room-update", { connectedUsers: newRoom.connectedUsers });
};

const joinRoomHandler = (data, socket) => {
  const { identity, roomId, onlyAudio } = data;

  const newUser = {
    identity,
    id: uuidv4(),
    socketId: socket.id,
    roomId,
    onlyAudio,
  };

  // Join Room as new user that pass roomId
  const room = rooms.find((room) => room.id == roomId);

  try {
    room.connectedUsers = [...room.connectedUsers, newUser];
  } catch (err) {
    console.log(err);
    return;
  }

  // Join SocketIO room
  socket.join(room.id);

  // Add newUser to connectedUser array
  connectedUsers = [...connectedUsers, newUser];

  // emit to all users which are already in the room to prepare peer connection
  room.connectedUsers.forEach((user) => {
    if (user.socketId !== socket.id) {
      const data = {
        connUserSocketId: socket.id,
      };
      // emit to all users that not of current socket to prepare connection
      io.to(user.socketId).emit("conn-prepare", data);
    }
  });

  io.to(room.id).emit("room-update", { connectedUsers: room.connectedUsers });
};

const disconnectHandler = (socket) => {
  // Find if user has been registered
  const user = connectedUsers.find((user) => user.socketId === socket.id);

  if (user) {
    // Find if the user room available in room array
    const room = rooms.find((room) => room.id === user.roomId);

    // update the room users by remove the user that are leaving
    room.connectedUsers = room.connectedUsers.filter(
      (user) => user.socketId !== socket.id
    );

    // user leave socket io room
    socket.leave(user.roomId);

    if (room.connectedUsers.length > 0) {
      // emit to all users which are still in the room that user disconnected
      io.to(room.id).emit("user-disconnected", {
        socketId: socket.id,
      });

      // emit an event to rest of the users which left in the room new connectedUsers in room
      io.to(room.id).emit("room-update", {
        connectedUsers: room.connectedUsers,
      });
    } else {
      // Update the rooms array and remove room with 0 users
      rooms = rooms.filter((room) => room.id !== room.id);
    }
  }
};

const signalingHandler = (data, socket) => {
  const { connUserSocketId, signal } = data;

  const signalingData = { signal, connUserSocketId: socket.id };
  io.to(connUserSocketId).emit("conn-signal", signalingData);
};

// Information from clients which are already in room that have prepare for incoming connection
const initializeConnectionHandler = (data, socket) => {
  const { connUserSocketId } = data;

  const initData = { connUserSocketId: socket.id };
  io.to(connUserSocketId).emit("conn-init", initData);
};

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
