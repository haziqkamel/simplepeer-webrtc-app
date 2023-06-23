import React, { useState } from "react";
import DirectChatHeader from "./DirectChatHeader";
import MessagesContainer from "./MessagesContainer";

const DirectChat = ({ activeConversation, directChatHistory }) => {
  const [messages, setMessages] = useState([]);
  return (
    <div className="direct_chat_container">
      <DirectChatHeader activeConversation={activeConversation} />
      <MessagesContainer messages={messages} />
    </div>
  );
};

export default DirectChat;
