import React from "react";
import { Message } from "../model/Message";

export interface MessageProps {
  message: Message;
}

const GlobalMessage: React.FC<MessageProps> = ({ message }: MessageProps) => (
  <div className={`message message--${message.type} mb-m`}>
    {message.message}
  </div>
);

export default GlobalMessage;
