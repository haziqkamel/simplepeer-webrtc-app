import io from "socket.io-client";
import store from "../store/store";
import { setRoomId, setParticipants } from "../store/action";

import * as webRTCHandler from "./webrtcHandler";

const SERVER = "http://localhost:5002";

let socket = null;

export const connectWithSocketIOServer = () => {
  socket = io(SERVER);

  socket.on("connect", () => {
    console.log("Successfully connected with socket IO Server");
    console.log(socket.id);
  });

  socket.on("room-id", (data) => {
    const { roomId } = data;
    store.dispatch(setRoomId(roomId));
  });

  socket.on("room-update", (data) => {
    const { connectedUsers } = data;
    store.dispatch(setParticipants(connectedUsers));
  });

  socket.on("conn-prepare", (data) => {
    const { connUserSocketId } = data;

    webRTCHandler.prepareNewPeerConnection(connUserSocketId, false);

    // Inform the user which just join the room that we have prepared for incoming connection
    socket.emit("conn-init", { connUserSocketId: connUserSocketId });
  });

  socket.on("conn-signal", (data) => {
    webRTCHandler.handleSignalingData(data);
  });

  socket.on("conn-init", (data) => {
    const { connUserSocketId } = data;

    webRTCHandler.prepareNewPeerConnection(connUserSocketId, true);
  });
};

export const createNewRoom = (identity) => {
  // Emit an event to server to create new room
  const data = {
    identity,
  };
  socket.emit("create-new-room", data);
};

export const joinRoom = (identity, roomId) => {
  // Emit an event to server to join room
  const data = {
    roomId,
    identity,
  };

  socket.emit("join-room", data);
};

export const signalPeerData = (data) => {
  socket.emit("conn-signal", data);
};
