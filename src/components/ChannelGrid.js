// src/components/ChannelGrid.js
import React from "react";

function ChannelGrid({ channels, onSelect, currentChannel }) {
  if (channels.length === 0) {
    return <p className="no-results">No channels match your search.</p>;
  }

  return (
    <div className="channel-grid">
      {channels.map((channel, index) => {
        const isActive =
          currentChannel && currentChannel.stream === channel.stream;

        return (
          <div
            key={channel.stream + index}
            className={`card ${isActive ? "active" : ""}`}
            onClick={() => onSelect(channel)}
            title={channel.name}
          >
            {channel.logo ? (
              <img
                src={channel.logo}
                alt={channel.name}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="no-logo"
              style={{ display: channel.logo ? "none" : "flex" }}
            >
              📺
            </div>

            <h3>{channel.name}</h3>
            {channel.category && (
              <p className="cat-label">{channel.category}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ChannelGrid;
