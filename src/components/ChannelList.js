// src/components/ChannelList.js
import React from "react";

const ChannelList = ({ channels, onSelect }) => {
  return (
    <div className="channel-list">
      {channels.map((ch, index) => (
        <div
          key={ch.name + index}  // Fixed: was ch.id which didn't exist
          className="channel"
          onClick={() => onSelect(ch)}
        >
          {ch.name}
        </div>
      ))}
    </div>
  );
};

export default ChannelList;
