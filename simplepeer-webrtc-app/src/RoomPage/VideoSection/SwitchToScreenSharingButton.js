import React, { useState } from "react";
import SwitchImg from "../../resources/images/switchToScreenSharing.svg";
import LocalScreenSharingPreview from "./LocalScreenSharingPreview";
import * as webRTCHandler from "../../utils/webrtcHandler";

const constraints = {
  audio: false,
  video: true,
};

const SwitchToScreenSharingButton = () => {
  const [isScreenSharingActive, setIsScreenSharingActive] = useState(false);
  const [screenSharingStream, setScreenSharingStream] = useState(null);

  const handleScreenShareToggle = async () => {
    if (!isScreenSharingActive) {
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      } catch (err) {
        console.log(
          `Error occured when trying to get an access to screen share stream ${err}`
        );
      }

      if (stream) {
        setScreenSharingStream(stream);

        webRTCHandler.toggleScreenShare(isScreenSharingActive, stream);
        setIsScreenSharingActive(true);
        // Execute function to switch the video track which we are sending to other users
      }
    } else {
      webRTCHandler.toggleScreenShare(isScreenSharingActive);

      // Switch for video track from camera
      setIsScreenSharingActive(false);

      // Stop screen share stream
      screenSharingStream.getTracks().forEach((track) => {
        track.stop();
      });
      setScreenSharingStream(null);
    }
  };

  return (
    <>
      <div className="video_button_container">
        <img
          src={SwitchImg}
          onClick={handleScreenShareToggle}
          className="video_button_image"
          alt="Handle Screen Share Toggle"
        />
      </div>
      {isScreenSharingActive && (
        <LocalScreenSharingPreview stream={screenSharingStream} />
      )}
    </>
  );
};

export default SwitchToScreenSharingButton;
