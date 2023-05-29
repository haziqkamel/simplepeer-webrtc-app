import { setShowOverlay } from "../store/action";
import store from "../store/store";
import * as wss from "./wss";
import Peer from "simple-peer";

const defaultConstraints = {
  audio: true,
  // Constraints the video quality for development
  video: {
    width: "480",
    height: "360",
  },
};

let localStream;

export const getLocalPreviewAndInitRoomConnection = (
  isRoomHost,
  identity,
  roomId = null
) => {
  navigator.mediaDevices
    .getUserMedia(defaultConstraints)
    .then((stream) => {
      console.log("Successfully received local stream");
      localStream = stream;
      showLocalVideoPreview(localStream);

      // dispatch an action to hide overlay
      store.dispatch(setShowOverlay(false));

      isRoomHost ? wss.createNewRoom(identity) : wss.joinRoom(identity, roomId);
    })
    .catch((err) => {
      console.log("Error occured when trying to get an access to local stream");
      console.log(err);
    });
};

// Implementation of SimplePeer - Simple WebRTC video, voice, and data channels
let peers = {};
let streams = [];

const getConfiguration = () => {
  return {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302", // STUN servers, can change to other STUN server which is free
      },
    ],
  };
};

export const prepareNewPeerConnection = (connUserSocketId, isInitiator) => {
  const configuration = getConfiguration();

  peers[connUserSocketId] = new Peer({
    initiator: isInitiator,
    config: configuration,
    stream: localStream,
  });

  peers[connUserSocketId].on("signal", (data) => {
    // WebRTC offer, WebRTC Answer (SDP Information), ICE candidates

    const signalData = {
      signal: data,
      connUserSocketId: connUserSocketId,
    };

    wss.signalPeerData(signalData);
  });

  peers[connUserSocketId].on("stream", (stream) => {
    console.log("new stream came");

    addStream(stream, connUserSocketId);
    streams = [...streams, stream];
  });
};

export const handleSignalingData = (data) => {
  // Add Signaling Data to Peer Connection
  peers[data.connUserSocketId].signal(data.signal);
};

export const removePeerConnection = (data) => {
  const { socketId } = data;
  console.log(`remove peer ${socketId}`);

  const videoContainer = document.getElementById(socketId);
  const videoElement = document.getElementById(`${socketId}-video`);

  // TODO: to debug issue when user left room error
  if (videoContainer && videoElement) {
    const tracks = videoElement.srcObject.getTracks();

    tracks.forEach((track) => track.stop());

    // Destroy the peers connection of the socketId
    if (peers[socketId]) {
      peers[socketId].destroy();
    }
    // Delete peers from array
    delete peers[socketId];

    // Remove element
    videoElement.srcObject = null;
    videoContainer.removeChild(videoElement);

    // Remove container
    videoContainer.parentNode.removeChild(videoContainer);
  }
};

// MARK:- Managing Video Stream
const showLocalVideoPreview = (stream) => {
  // Show local video preview
  const videosContainer = document.getElementById("videos_portal");
  videosContainer.classList.add("videos_portal_styles");

  const videoContainer = document.createElement("div");
  videoContainer.classList.add("video_track_container");

  const videoElement = document.createElement("video");
  videoElement.autoplay = true;
  videoElement.muted = true;
  videoElement.srcObject = stream;

  videoElement.onloadedmetadata = () => {
    videoElement.play();
  };

  videoContainer.appendChild(videoElement);
  videosContainer.appendChild(videoContainer);
};

const addStream = (stream, connUserSocketId) => {
  // display incoming streams
  const videosContainer = document.getElementById("videos_portal");
  const videoContainer = document.createElement("div");

  videoContainer.id = connUserSocketId;

  videoContainer.classList.add("video_track_container");
  const videoElement = document.createElement("video");
  videoElement.autoplay = true;
  // videoElement.muted = true;
  videoElement.srcObject = stream;

  videoElement.id = `${connUserSocketId}-video`;

  videoElement.onloadedmetadata = () => {
    videoElement.play();
  };

  videoElement.addEventListener("click", () => {
    if (videoElement.classList.contains("full_screen")) {
      videoElement.classList.remove("full_screen");
    } else {
      videoElement.classList.add("full_screen");
    }
  });

  videoContainer.appendChild(videoElement);
  videosContainer.appendChild(videoContainer);
};

// MARK:- Room Buttons Functionality
export const toggleMic = (isMuted) => {
  console.log(`Value of isMuted=${isMuted}`);
  localStream.getAudioTracks()[0].enabled = isMuted ? true : false;
};

export const toggleCamera = (isDisabled) => {
  console.log(`Value of isCamera=${isDisabled}`);
  localStream.getVideoTracks()[0].enabled = isDisabled ? true : false;
};

export const toggleScreenShare = (
  isScreenSharingActive,
  screenSharingStream = null
) => {
  if (isScreenSharingActive) {
    // Switch stream to screen
    switchVideoTracks(localStream);
  } else {
    switchVideoTracks(screenSharingStream);
  }
};

const switchVideoTracks = (stream) => {
  for (let socket_id in peers) {
    for (let index in peers[socket_id].streams[0].getTracks()) {
      for (let index2 in stream.getTracks()) {
        if (
          peers[socket_id].streams[0].getTracks()[index].kind ===
          stream.getTracks()[index2].kind
        ) {
          peers[socket_id].replaceTrack(
            peers[socket_id].streams[0].getTracks()[index],
            stream.getTracks()[index2],
            peers[socket_id].streams[0]
          );
          break;
        }
      }
    }
  }
};
