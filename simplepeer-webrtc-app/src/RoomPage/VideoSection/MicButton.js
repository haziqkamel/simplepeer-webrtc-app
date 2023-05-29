import React, { useState } from "react";
import MicButtonImg from "../../resources/images/mic.svg";
import MicButtonImgOff from "../../resources/images/micOff.svg";
import * as webRTCHandler from "../../utils/webrtcHandler";

const MicButton = () => {
  const [isMicMuted, setIsMicMuted] = useState(false);

  const handleMicButtonPressed = () => {
    webRTCHandler.toggleMic(isMicMuted);
    setIsMicMuted(!isMicMuted);
  };

  return (
    <div className="video_button_container">
      <img
        src={isMicMuted ? MicButtonImg : MicButtonImgOff}
        onClick={handleMicButtonPressed}
        className="video_button_img"
        alt="mic button"
      />
    </div>
  );
};

export default MicButton;
