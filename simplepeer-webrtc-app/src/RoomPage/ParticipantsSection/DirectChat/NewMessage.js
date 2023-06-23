import React, { useState } from "react";
import sendMessageButton from "../../../resources/images/sendMessageButton.svg";

const NewMessage = ({ activeConversation, identity }) => {
  const [message, setMessage] = useState("");

  const sendMessage = () => {};

  const handleTextChange = (event) => {
    setMessage(event.target.value);
  };

  const handleKeyPressed = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="new_message_container new_message_direct_border">
      <input
        className="new_message_input"
        value={message}
        onChange={handleTextChange}
        placeholder="Type your message.."
        type="text"
        onKeyDown={handleKeyPressed}
      />
      <img
        className="new_message_button"
        src={sendMessageButton}
        onClick={sendMessage}
        alt="send message"
      />
    </div>
  );
};

export default NewMessage;
