// src/components/Player.js
import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const PROXY = "http://localhost:3001/proxy?url=";

function proxyUrl(stream) {
  return PROXY + encodeURIComponent(stream);
}

const Player = ({ stream }) => {
  // This ref points to the stable wrapper div — React never re-renders inside it
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const videoElRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Manually create the video element so React never owns it
    const videoEl = document.createElement("video");
    videoEl.className = "video-js vjs-big-play-centered";
    containerRef.current.appendChild(videoEl);
    videoElRef.current = videoEl;

    playerRef.current = videojs(videoEl, {
      controls: true,
      autoplay: true,
      fluid: true,
      liveui: true,
      html5: {
        hls: { overrideNative: true },
      },
    });

    return () => {
      // Dispose player first, then remove the element
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []); // run once only

  // Update stream URL whenever prop changes
  useEffect(() => {
    if (!playerRef.current || playerRef.current.isDisposed() || !stream) return;

    playerRef.current.src({
      src: proxyUrl(stream),
      type: "application/x-mpegURL",
    });

    playerRef.current.play().catch(() => {});
  }, [stream]);

  return (
    <div className="player-wrapper">
      {/* React only owns this outer div; video.js owns everything inside containerRef */}
      <div ref={containerRef} />
    </div>
  );
};

export default Player;