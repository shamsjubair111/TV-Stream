# 📺 TV-Stream — BD Live TV Player

A React-based live IPTV player for Bangladeshi, Indian, and International channels. Streams HLS (`.m3u8`) channels through a local Express proxy server to bypass CORS restrictions.

---

## 🖥️ Preview

> Browse 170+ live channels, search by name, filter by category, and watch directly in the browser using a built-in HLS video player.

---

## ✨ Features

- 🔴 **Live HLS streaming** via video.js
- 🔁 **Local proxy server** to bypass CORS and geo-restrictions
- 📋 **170+ channels** auto-loaded from a public M3U playlist
- 🔍 **Search** channels by name in real time
- 🗂️ **Category filters** — Bangla News, Entertainment, Music, Sports, Kids, International, and more
- 🧹 **Auto-deduplication** — picks the best stream source per channel
- ⚠️ **Error handling** — shows a message if a stream is unavailable
- 📱 **Responsive** layout for desktop and mobile

---

## 🗂️ Project Structure

```
TV-Stream/
├── public/
├── src/
│   ├── components/
│   │   ├── Player.js        # HLS video player (video.js)
│   │   ├── ChannelGrid.js   # Channel card grid
│   │   └── ChannelList.js   # Channel list view
│   ├── utils/
│   │   └── loadChannels.js  # Fetches & parses M3U playlist
│   ├── App.js               # Main app — search, filter, state
│   ├── App.css              # Styling
│   └── index.js
├── server.js                # Express CORS proxy server
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/shamsjubair111/TV-Stream.git
cd TV-Stream

# Install React app dependencies
npm install

# Install proxy server dependencies
npm install express cors
```

---

## ▶️ Running the App

You need **two terminals** running at the same time.

**Terminal 1 — Start the proxy server:**
```bash
node server.js
```
> Proxy will run at `http://localhost:3001`

**Terminal 2 — Start the React app:**
```bash
npm start
```
> App will open at `http://localhost:3000`

---

## ⚙️ How It Works

```
Browser (React)
    │
    │  requests M3U playlist
    ▼
loadChannels.js  ──────────►  GitHub Raw M3U file
    │
    │  parses 170+ channels
    ▼
ChannelGrid (UI)
    │
    │  user clicks a channel
    ▼
Player.js
    │
    │  sends stream URL to proxy
    ▼
server.js (localhost:3001)
    │
    │  forwards request with VLC headers
    │  rewrites M3U8 segment URLs
    ▼
IPTV Stream Server  ──────►  video.js plays the stream
```

**Why a proxy?**
IPTV stream servers block direct browser requests (CORS policy). The local Express server fetches the stream server-side, spoofing a VLC media player identity, and pipes the response back to the browser with CORS headers added. It also rewrites all `.ts` segment URLs inside M3U8 playlists so every request goes through the proxy.

---

## 📡 Channel Categories

| Category | Examples |
|---|---|
| Bangla News | Somoy TV, Jamuna TV, DBC News, News 24, Independent TV |
| Bangla Entertainment | GTV, Maasranga, NTV, Channel I, Deepto TV, Desh TV |
| Bangla Music | Gaan Bangla, Sangeet Bangla, ATN Music |
| Indian Entertainment | Star Plus, Star Jalsha, Zee TV, Colors, Sony TV |
| Sports | Star Sports, Sony Ten, DD Sports, PTV Sports |
| Kids | Nickelodeon, Cartoon Network, Disney, CBeebies |
| International News | BBC World, CNN, Al Jazeera, DW, NDTV |
| Movies | Star Gold, Zee Cinema, Sony Max, B4U Movies |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Video Player | video.js |
| Proxy Server | Node.js + Express |
| Stream Format | HLS (M3U8) |
| Styling | Plain CSS |
| Channel Source | Public M3U Playlist |

---

## ⚠️ Troubleshooting

**Channels not loading**
- Make sure you have an internet connection
- Open browser DevTools (F12) → Console and check for errors

**Stream shows error / 502 Bad Gateway**
- Make sure `node server.js` is running in a separate terminal
- Some streams are geo-restricted or offline — try a different channel
- Test a stream directly: `http://localhost:3001/proxy?url=<encoded-stream-url>`

**`insertBefore` React error**
- Hard refresh the page: `Ctrl + Shift + R`

**Port already in use**
```bash
# Kill whatever is using port 3001
npx kill-port 3001
node server.js
```

---

## 📝 Notes

- This project is for **personal/educational use only**
- Stream availability depends on the source M3U playlist and your ISP
- Some channels may be geo-restricted in certain regions
- The proxy server must be running locally — it is not deployed

---

## 📄 License

MIT License — feel free to use and modify.

---

## 👤 Author

**Shams Jubair**
- GitHub: [@shamsjubair111](https://github.com/shamsjubair111)
