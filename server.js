// server.js — node server.js
// npm install express cors   (no node-fetch needed)

const express = require("express");
const cors = require("cors");
const http = require("http");
const https = require("https");
const { URL } = require("url");

const app = express();
const PORT = 3001;

app.use(cors({ origin: "*" }));

// Ignore bad SSL certs on IPTV servers
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function fetchStream(targetUrl, res, hops = 0) {
  if (hops > 5) return res.status(502).send("Too many redirects");

  let parsed;
  try { parsed = new URL(targetUrl); }
  catch (e) { return res.status(400).send("Invalid URL"); }

  const isHttps = parsed.protocol === "https:";
  const lib = isHttps ? https : http;

  const options = {
    hostname: parsed.hostname,
    port: parsed.port || (isHttps ? 443 : 80),
    path: parsed.pathname + (parsed.search || ""),
    method: "GET",
    headers: {
      "User-Agent":      "VLC/3.0.18 LibVLC/3.0.18",
      "Accept":          "application/x-mpegURL, application/vnd.apple.mpegurl, video/mp2t, */*",
      "Accept-Encoding": "identity",
      "Connection":      "keep-alive",
    },
    timeout: 15000,
  };

  console.log(`[proxy] → ${targetUrl}`);

  const upstream = lib.request(options, (upRes) => {
    console.log(`[proxy] ← ${upRes.statusCode} ${targetUrl}`);

    // Follow redirects
    if ([301,302,307,308].includes(upRes.statusCode)) {
      const loc = upRes.headers["location"];
      if (loc) {
        const abs = loc.startsWith("http") ? loc : new URL(loc, targetUrl).href;
        upRes.resume();
        return fetchStream(abs, res, hops + 1);
      }
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.status(upRes.statusCode);

    const ct = upRes.headers["content-type"] || "";
    const isPlaylist = targetUrl.includes(".m3u8") || ct.includes("mpegurl");

    if (isPlaylist) {
      // Buffer and rewrite URLs
      let body = "";
      upRes.setEncoding("utf8");
      upRes.on("data", c => body += c);
      upRes.on("end", () => {
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.send(rewritePlaylist(body, targetUrl));
      });
    } else {
      // TS segments — stream directly
      res.setHeader("Content-Type", ct || "video/mp2t");
      upRes.pipe(res);
    }
  });

  upstream.on("timeout", () => {
    upstream.destroy();
    if (!res.headersSent) res.status(504).json({ error: "Timeout" });
  });

  upstream.on("error", (err) => {
    console.error(`[proxy] ERR ${err.message}`);
    if (!res.headersSent) res.status(502).json({ error: err.message });
  });

  upstream.end();
}

function rewritePlaylist(text, baseUrl) {
  const base = new URL(baseUrl);
  return text.split("\n").map(line => {
    const t = line.trim();
    if (!t || t.startsWith("#")) return line;
    let abs;
    if (t.startsWith("http://") || t.startsWith("https://")) {
      abs = t;
    } else {
      try { abs = new URL(t, base).href; } catch { return line; }
    }
    return `http://localhost:3001/proxy?url=` + encodeURIComponent(abs);
  }).join("\n");
}

app.get("/proxy", (req, res) => {
  const raw = req.query.url;
  if (!raw) return res.status(400).json({ error: "Missing ?url=" });
  fetchStream(decodeURIComponent(raw), res);
});

app.get("/probe", (req, res) => {
  const raw = req.query.url;
  if (!raw) return res.json({ ok: false });
  const decoded = decodeURIComponent(raw);
  let parsed;
  try { parsed = new URL(decoded); } catch { return res.json({ ok: false }); }

  const lib = parsed.protocol === "https:" ? https : http;
  const r = lib.request({
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
    path: parsed.pathname + (parsed.search || ""),
    method: "GET",
    headers: { "User-Agent": "VLC/3.0.18 LibVLC/3.0.18" },
    timeout: 6000,
  }, (upRes) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json({ ok: upRes.statusCode < 400, status: upRes.statusCode });
    upRes.resume();
  });
  r.on("error", err => { res.setHeader("Access-Control-Allow-Origin","*"); res.json({ ok: false, error: err.message }); });
  r.end();
});

app.listen(PORT, () => {
  console.log(`\n✅ Proxy running → http://localhost:${PORT}`);
  console.log(`   Browser test: http://localhost:${PORT}/proxy?url=https%3A%2F%2Fedge01.iptv.digijadoo.net%2Flive%2Fgazi_tv%2Fchunks.m3u8\n`);
});