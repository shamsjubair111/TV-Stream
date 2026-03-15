// src/App.js
import React, { useState, useEffect } from "react";
import Player from "./components/Player";
import ChannelGrid from "./components/ChannelGrid";
import { loadChannels } from "./utils/loadChannels";
import "./App.css";

const CATEGORIES = [
  "All",
  "Bangla News",
  "Bangla Entertainment",
  "Bangla Music",
  "Indian Entertainment",
  "International",
  "Other",
];

function App() {
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchChannels() {
      setLoading(true);
      setError(null);
      try {
        const list = await loadChannels();
        if (list.length === 0) {
          setError("No channels found. Check your internet connection.");
        } else {
          setChannels(list);
          setCurrentChannel(list[0]);
        }
      } catch (e) {
        setError("Failed to load channels: " + e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchChannels();
  }, []);

  const filtered = channels.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || c.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="app">
      <h1>📺 BD Live TV</h1>

      {loading && <div className="status-msg">⏳ Loading channels...</div>}
      {error && <div className="status-msg error">⚠️ {error}</div>}

      {currentChannel && !loading && (
        <div className="now-playing">
          <span>▶ Now Playing: </span>
          <strong>{currentChannel.name}</strong>
          <span className="badge">{currentChannel.category}</span>
        </div>
      )}

      {currentChannel && <Player stream={currentChannel.stream} />}

      <div className="controls">
        <input
          placeholder="🔍 Search channel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`tab ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {!loading && (
        <p className="count">
          Showing {filtered.length} of {channels.length} channels
        </p>
      )}

      <ChannelGrid channels={filtered} onSelect={setCurrentChannel} currentChannel={currentChannel} />
    </div>
  );
}

export default App;
