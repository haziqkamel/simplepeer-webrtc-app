import React, { useEffect } from "react";
import { connect } from "react-redux";
import "./RoomPage.css";
import ParticipantsSection from "./ParticipantsSection/ParticipantsSection";
import VideoSection from "./VideoSection/VideoSection";
import ChatSection from "./ChatSection/ChatSection";
import RoomLabel from "./RoomLabel";
import * as webrtcHandler from "../utils/webrtcHandler";
import Overlay from "./overlay";

const RoomPage = ({ roomId, identity, isRoomHost, showOverlay }) => {
  useEffect(() => {
    webrtcHandler.getLocalPreviewAndInitRoomConnection(
      isRoomHost,
      identity,
      roomId
    );
  });

  return (
    <div className="room_container">
      <ParticipantsSection />
      <VideoSection />
      <ChatSection />
      <RoomLabel roomId={roomId} />
      {showOverlay && <Overlay />}
    </div>
  );
};

const mapStoreStateToProps = (state) => {
  return {
    ...state,
  };
};

export default connect(mapStoreStateToProps)(RoomPage);
