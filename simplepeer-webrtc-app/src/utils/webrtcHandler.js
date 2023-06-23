import { setMessages, setShowOverlay } from "../store/action";
import store from "../store/store";
import { fetchTURNCredentials, getTURNIceServers } from "./turn";
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

const onlyAudioConstraints = {
  audio: true,
  video: false,
};

let localStream;

export const getLocalPreviewAndInitRoomConnection = async (
  isRoomHost,
  identity,
  roomId = null,
  onlyAudio
) => {
  await fetchTURNCredentials();

  const constraints = onlyAudio ? onlyAudioConstraints : defaultConstraints;

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      console.log("Successfully received local stream");
      localStream = stream;
      showLocalVideoPreview(localStream);

      // dispatch an action to hide overlay
      store.dispatch(setShowOverlay(false));

      isRoomHost
        ? wss.createNewRoom(identity, onlyAudio)
        : wss.joinRoom(identity, roomId, onlyAudio);
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
  const turnIceServers = getTURNIceServers();

  if (turnIceServers) {
    console.log("TURN server credentials fetched");
    console.log(turnIceServers);
    return {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
        ...turnIceServers,
      ],
    };
  } else {
    console.warn("Using only STUN server");
    return {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302", // STUN servers, can change to other STUN server which is free
        },
      ],
    };
  }
};

const messengerChannel = "messenger";

export const prepareNewPeerConnection = (connUserSocketId, isInitiator) => {
  const configuration = getConfiguration();

  peers[connUserSocketId] = new Peer({
    initiator: isInitiator,
    config: configuration,
    stream: localStream,
    channelName: messengerChannel,
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

  // TODO: Debug or change implementation out of peers
  // peers[connUserSocketId].on("data", (data) => {
  //   const messageData = JSON.parse(data);

  //   appendNewMessage(messageData);
  // });
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

  if (store.getState().connectOnlyWithAudio) {
    videoContainer.appendChild(getAudioOnlyLabel());
  }

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

  // check if other user connected only with audio
  const participants = store.getState().participants;
  const participant = participants.find((p) => p.socketId === connUserSocketId);

  if (participant?.onlyAudio) {
    videoContainer.appendChild(getAudioOnlyLabel(participant.identity));
  }

  videosContainer.appendChild(videoContainer);
};

const getAudioOnlyLabel = (identity = "") => {
  const labelContainer = document.createElement("div");
  labelContainer.classList.add("label_only_audio_container");

  const label = document.createElement("p");
  label.classList.add("label_only_audio_text");
  label.innerHTML = `Only Audio ${identity}`;

  labelContainer.appendChild(label);
  return labelContainer;
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

// MARK:- Chatting
const appendNewMessage = (messageData) => {
  const messages = store.getState().messages;
  store.dispatch(setMessages([...messages, messageData]));
};

export const sendMessageUsingDataChannel = (messageContent) => {
  // Append the message locally
  const identity = store.getState().identity;

  const localMessageData = {
    content: messageContent,
    identity,
    messageCreatedByMe: true,
  };

  appendNewMessage(localMessageData);

  const messagedData = {
    content: messageContent,
    identity,
  };

  const stringifiedMessageData = JSON.stringify(messagedData);

  for (let socketId in peers) {
    peers[socketId].send(stringifiedMessageData);
  }
};
