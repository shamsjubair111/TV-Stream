// utils/loadChannels.js

const CHANNEL_CATEGORIES = [
  {
    category: "Bangla News",
    keywords: ["somoy", "jamuna", "news 24", "dbc news", "ekattor", "independent", "channel 24", "nagorik", "rtv", "sa tv", "satv", "shomoy", "atn news"],
  },
  {
    category: "Bangla Entertainment",
    keywords: ["gazi", "gtv", "maasranga", "channel i", "ntv", "boishakhi", "deepto", "desh tv", "duronto", "ekushey", "channel 9", "my tv", "mytv", "mohona", "bangla tv", "ruposhi", "tara bangla"],
  },
  {
    category: "Bangla Music",
    keywords: ["gaan bangla", "sangeet bangla", "atn music", "atn bangla"],
  },
  {
    category: "Indian Entertainment",
    keywords: ["star plus", "star jalsha", "zee tv", "colors", "sony", "star gold", "star bharat", "zee bangla", "zee cinema", "jalsha movies"],
  },
  {
    category: "International",
    keywords: ["bbc", "cnn", "al jazeera", "dw", "euronews", "nhk", "arirang"],
  },
];

function getCategory(name) {
  const lower = name.toLowerCase();
  for (const cat of CHANNEL_CATEGORIES) {
    if (cat.keywords.some((k) => lower.includes(k))) return cat.category;
  }
  return "Other";
}

// Channel name → logo URL (using a public IPTV logo CDN)
const LOGO_MAP = {
  "gazi tv": "https://i.imgur.com/YKqkZ5C.png",
  gtv: "https://i.imgur.com/YKqkZ5C.png",
  maasranga: "https://i.imgur.com/8zYxqXH.png",
  "asian tv": "https://i.imgur.com/placeholder.png",
  "atn bangla": "https://i.imgur.com/5rQxZ9k.png",
  "atn news": "https://i.imgur.com/5rQxZ9k.png",
  banglavision: "https://i.imgur.com/placeholder.png",
  "bangla vision": "https://i.imgur.com/placeholder.png",
  ntv: "https://i.imgur.com/placeholder.png",
  "channel i": "https://i.imgur.com/placeholder.png",
  "star plus": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Star_Plus_logo.svg/200px-Star_Plus_logo.svg.png",
  "star jalsha": "https://upload.wikimedia.org/wikipedia/en/thumb/0/06/Star_Jalsha.svg/200px-Star_Jalsha.svg.png",
  "zee tv": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Zee_TV_logo.svg/200px-Zee_TV_logo.svg.png",
  "al jazeera": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Al_Jazeera_English_Logo.svg/200px-Al_Jazeera_English_Logo.svg.png",
  "bbc world": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/BBC_World_News_2022_%28Boxed%29.svg/200px-BBC_World_News_2022_%28Boxed%29.svg.png",
  cnn: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/200px-CNN.svg.png",
};

function getLogo(name) {
  const lower = name.toLowerCase();
  for (const [key, url] of Object.entries(LOGO_MAP)) {
    if (lower.includes(key)) return url;
  }
  return null;
}

// All channel keywords to include (broad match)
const INCLUDE_KEYWORDS = [
  // Bangladeshi
  "gazi", "gtv",
  "maasranga",
  "asian tv",
  "atn bangla", "atn news", "atn music",
  "banglavision", "bangla vision", "bangla tv",
  "boishakhi",
  "btv",
  "channel 9", "channel i", "channel 24",
  "dbc news",
  "deepto",
  "desh tv",
  "duronto",
  "ekattor",
  "ekushey",
  "gaan bangla",
  "independent",
  "jamuna",
  "maasranga",
  "mohona",
  "my tv", "mytv",
  "nagorik",
  "news 24",
  "ntv",
  "rtv",
  "sa tv", "satv",
  "sangeet bangla",
  "sangsad",
  "shomoy", "somoy",
  "ruposhi bangla",
  "tara bangla",
  "zee bangla",
  "colors bangla",
  "star jalsha",
  "jalsha movies",
  "dd bangla",
  "sony aath",
];

export async function loadChannels() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/Shadmanislam/bdiptv/refs/heads/master/BD%20IPTV.m3u"
    );

    if (!response.ok) {
      throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    const lines = text.split("\n");

    const channels = [];
    const seenStreams = new Set(); // deduplicate by stream URL

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith("#EXTINF")) {
        // Name is after the last comma
        const commaIdx = line.lastIndexOf(",");
        const name = commaIdx !== -1 ? line.slice(commaIdx + 1).trim() : null;

        if (!name) continue;

        const lower = name.toLowerCase();
        const matched = INCLUDE_KEYWORDS.some((k) => lower.includes(k));
        if (!matched) continue;

        // Find the next non-empty, non-comment line as the stream URL
        let stream = null;
        for (let j = i + 1; j < lines.length && j <= i + 2; j++) {
          const next = lines[j]?.trim();
          if (next && !next.startsWith("#")) {
            stream = next;
            break;
          }
        }

        if (!stream) continue;
        if (seenStreams.has(stream)) continue; // skip duplicate streams
        seenStreams.add(stream);

        channels.push({
          name,
          stream,
          category: getCategory(name),
          logo: getLogo(name),
        });
      }
    }

    console.log(`✅ Loaded ${channels.length} channels`);
    return channels;
  } catch (err) {
    console.error("❌ Failed to load channels:", err.message);
    return [];
  }
}
