import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildNaverDirectionsUrl,
  buildNaverLocalSearchUrl,
  buildNaverGeocodeUrl,
  getNaverMapFailureMessage,
  isValidNaverMapKey
} from "./map-utils.js";

const root = fileURLToPath(new URL(".", import.meta.url));

async function loadEnvFile(filePath = join(root, ".env"), options = {}) {
  let contents;
  try {
    contents = await readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }

  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && (options.override || process.env[key] === undefined)) {
      process.env[key] = value;
    }
  });
}

await loadEnvFile();

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

const port = Number(process.env.PORT || 8765);
const naverMapsApiKeyId = process.env.NAVER_MAPS_API_KEY_ID || process.env.NCP_API_KEY_ID || "";
const naverMapsApiKey = process.env.NAVER_MAPS_API_KEY || process.env.NCP_API_KEY || "";
const naverSearchClientId = process.env.NAVER_SEARCH_CLIENT_ID || "";
const naverSearchClientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET || "";
let youtubeApiKey = process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_DATA_API_KEY || "";
let spotifyClientId = process.env.SPOTIFY_CLIENT_ID || "";
let spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";

let spotifyAccessToken = "";
let spotifyTokenExpiresAt = 0;

async function refreshMediaCredentials() {
  const previousYouTubeApiKey = youtubeApiKey;
  const previousClientId = spotifyClientId;
  const previousClientSecret = spotifyClientSecret;
  await loadEnvFile(join(root, ".env"), { override: true });
  youtubeApiKey = process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_DATA_API_KEY || "";
  spotifyClientId = process.env.SPOTIFY_CLIENT_ID || "";
  spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";

  if (
    youtubeApiKey !== previousYouTubeApiKey ||
    spotifyClientId !== previousClientId ||
    spotifyClientSecret !== previousClientSecret
  ) {
    spotifyAccessToken = "";
    spotifyTokenExpiresAt = 0;
  }
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function sendMediaSearchFailure(response, error, message, details = {}) {
  sendJson(response, 200, {
    ok: false,
    error,
    message,
    items: [],
    ...details
  });
}

async function readJsonResponse(upstreamResponse, fallbackMessage) {
  const text = await upstreamResponse.text();
  try {
    return JSON.parse(text);
  } catch {
    const trimmedText = text.trim();
    const upstreamMessage = trimmedText
      ? `${fallbackMessage}: ${trimmedText.slice(0, 180)}`
      : fallbackMessage;
    throw new Error(upstreamMessage);
  }
}

function decodeBasicHtmlEntities(value) {
  return String(value || "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&#x27;", "'");
}

function parsePoint(value) {
  const parsed = JSON.parse(value || "{}");
  return {
    lng: Number(parsed.lng ?? parsed.x),
    lat: Number(parsed.lat ?? parsed.y),
    name: parsed.name || ""
  };
}

function isValidPoint(point) {
  return Number.isFinite(point.lng) && Number.isFinite(point.lat);
}

async function handleDirections(request, response, url) {
  if (!isValidNaverMapKey(naverMapsApiKeyId) || !isValidNaverMapKey(naverMapsApiKey)) {
    sendJson(response, 503, {
      error: "missing-naver-directions-key",
      message: getNaverMapFailureMessage("directions-key")
    });
    return;
  }

  let origin;
  let destination;
  try {
    origin = parsePoint(url.searchParams.get("origin"));
    destination = parsePoint(url.searchParams.get("destination"));
  } catch {
    sendJson(response, 400, { error: "invalid-route-points", message: "Origin or destination is invalid." });
    return;
  }

  if (!isValidPoint(origin) || !isValidPoint(destination)) {
    sendJson(response, 400, { error: "invalid-route-points", message: "Origin or destination is invalid." });
    return;
  }

  const option = url.searchParams.get("option") || "traoptimal";
  const directionsUrl = buildNaverDirectionsUrl({ origin, destination, option });
  const naverResponse = await fetchWithTimeout(directionsUrl, {
    headers: {
      "x-ncp-apigw-api-key-id": naverMapsApiKeyId,
      "x-ncp-apigw-api-key": naverMapsApiKey
    }
  });
  const payload = await naverResponse.json();
  sendJson(response, naverResponse.ok ? 200 : naverResponse.status, payload);
}

async function handleLocalSearch(request, response, url) {
  const query = String(url.searchParams.get("query") || "").trim();
  if (!query) {
    sendJson(response, 400, { error: "empty-query", message: getNaverMapFailureMessage("search-empty") });
    return;
  }

  const items = [];

  // 1. Try Geocoding API if NCP keys are available
  if (isValidNaverMapKey(naverMapsApiKeyId) && isValidNaverMapKey(naverMapsApiKey)) {
    try {
      const geocodeUrl = buildNaverGeocodeUrl({ query });
      const geocodeResponse = await fetchWithTimeout(geocodeUrl, {
        headers: {
          "x-ncp-apigw-api-key-id": naverMapsApiKeyId,
          "x-ncp-apigw-api-key": naverMapsApiKey
        }
      });
      if (geocodeResponse.ok) {
        const data = await geocodeResponse.json();
        if (data.status === "OK" && Array.isArray(data.addresses)) {
          data.addresses.forEach((addr) => {
            items.push({
              title: addr.roadAddress || addr.jibunAddress,
              category: "주소",
              roadAddress: addr.roadAddress || "",
              address: addr.jibunAddress || "",
              mapx: Math.round(Number(addr.x) * 10000000),
              mapy: Math.round(Number(addr.y) * 10000000)
            });
          });
        }
      }
    } catch (err) {
      console.error("Geocoding API error:", err);
    }
  }

  // 2. Try Local Search API if Search keys are configured
  if (naverSearchClientId && naverSearchClientSecret) {
    try {
      const searchUrl = buildNaverLocalSearchUrl({ query });
      const searchResponse = await fetchWithTimeout(searchUrl, {
        headers: {
          "X-Naver-Client-Id": naverSearchClientId,
          "X-Naver-Client-Secret": naverSearchClientSecret
        }
      });
      if (searchResponse.ok) {
        const data = await searchResponse.json();
        if (Array.isArray(data.items)) {
          data.items.forEach((poi) => {
            const cleanTitle = String(poi.title || "").replace(/<[^>]*>/g, "");
            const duplicate = items.some(item => item.title === cleanTitle);
            if (!duplicate) {
              items.push({
                title: poi.title,
                category: poi.category || "",
                roadAddress: poi.roadAddress || "",
                address: poi.address || "",
                mapx: Number(poi.mapx),
                mapy: Number(poi.mapy)
              });
            }
          });
        }
      }
    } catch (err) {
      console.error("Local Search API error:", err);
    }
  }

  const hasNcpKeys = isValidNaverMapKey(naverMapsApiKeyId) && isValidNaverMapKey(naverMapsApiKey);
  const hasSearchKeys = Boolean(naverSearchClientId && naverSearchClientSecret);
  if (!hasNcpKeys && !hasSearchKeys) {
    sendJson(response, 503, {
      error: "missing-keys",
      message: getNaverMapFailureMessage("local-search-key")
    });
    return;
  }

  sendJson(response, 200, { items });
}

async function handleMediaSearch(request, response, url) {
  const provider = String(url.searchParams.get("provider") || "").trim();
  const query = String(url.searchParams.get("query") || "").trim();

  if (!query) {
    sendJson(response, 400, { error: "empty-query", message: "Search query is required." });
    return;
  }

  if (provider === "youtube") {
    await handleYouTubeSearch(response, query, provider);
    return;
  }

  if (provider === "spotify") {
    await handleSpotifySearch(response, query);
    return;
  }

  sendJson(response, 400, { error: "unsupported-provider", message: "Unsupported media provider." });
}

async function handleYouTubeSearch(response, query, provider) {
  await refreshMediaCredentials();

  if (!youtubeApiKey) {
    sendMediaSearchFailure(response, "missing-youtube-key", "YOUTUBE_API_KEY is required.");
    return;
  }

  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("maxResults", "12");
  searchUrl.searchParams.set("key", youtubeApiKey);

  const youtubeResponse = await fetchWithTimeout(searchUrl, {
    headers: {
      "Accept": "application/json"
    }
  });
  let payload;
  try {
    payload = await readJsonResponse(youtubeResponse, "YouTube search returned a non-JSON response");
  } catch (error) {
    sendMediaSearchFailure(response, "youtube-search-invalid-response", error.message);
    return;
  }

  if (!youtubeResponse.ok) {
    sendMediaSearchFailure(response, "youtube-search-failed", payload.error?.message || "YouTube search failed.", {
      upstreamStatus: youtubeResponse.status
    });
    return;
  }

  const items = (payload.items || []).map((item) => ({
    id: `youtube:${item.id?.videoId || item.etag}`,
    provider,
    type: "video",
    title: decodeBasicHtmlEntities(item.snippet?.title || "Untitled"),
    creator: decodeBasicHtmlEntities(item.snippet?.channelTitle || "YouTube"),
    description: decodeBasicHtmlEntities(item.snippet?.description || "YouTube result"),
    imageUrl: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || "",
    externalUrl: item.id?.videoId
      ? `https://www.youtube.com/watch?v=${item.id.videoId}`
      : ""
  }));

  sendJson(response, 200, { ok: true, items });
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.round(Number(milliseconds || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

async function getSpotifyAccessToken() {
  const now = Date.now();
  if (spotifyAccessToken && spotifyTokenExpiresAt > now + 30000) {
    return spotifyAccessToken;
  }

  const tokenResponse = await fetchWithTimeout("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json"
    },
    body: new URLSearchParams({ grant_type: "client_credentials" })
  });
  const payload = await readJsonResponse(tokenResponse, "Spotify token endpoint returned a non-JSON response");

  if (!tokenResponse.ok || !payload.access_token) {
    const message = payload.error_description || payload.error || "Spotify access token request failed.";
    throw new Error(message);
  }

  spotifyAccessToken = payload.access_token;
  spotifyTokenExpiresAt = now + Math.max(0, Number(payload.expires_in || 0) - 60) * 1000;
  return spotifyAccessToken;
}

async function handleSpotifySearch(response, query) {
  await refreshMediaCredentials();

  if (!spotifyClientId || !spotifyClientSecret) {
    sendMediaSearchFailure(response, "missing-spotify-credentials", "SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are required.");
    return;
  }

  let accessToken;
  try {
    accessToken = await getSpotifyAccessToken();
  } catch (error) {
    sendMediaSearchFailure(response, "spotify-token-failed", error.message || "Spotify access token request failed.");
    return;
  }

  const searchUrl = new URL("https://api.spotify.com/v1/search");
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("type", "track");
  searchUrl.searchParams.set("limit", "10"); // Dev mode cap: max 10

  const spotifyResponse = await fetchWithTimeout(searchUrl, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/json"
    }
  });
  let payload;
  try {
    payload = await readJsonResponse(spotifyResponse, "Spotify search returned a non-JSON response");
  } catch (error) {
    sendMediaSearchFailure(response, "spotify-search-invalid-response", error.message);
    return;
  }

  if (!spotifyResponse.ok) {
    sendMediaSearchFailure(response, "spotify-search-failed", payload.error?.message || "Spotify search failed.", {
      upstreamStatus: spotifyResponse.status
    });
    return;
  }

  const items = (payload.tracks?.items || []).map((track) => {
    const image = track.album?.images?.[1] || track.album?.images?.[0] || track.album?.images?.[2];
    return {
      id: `spotify:${track.id}`,
      provider: "spotify",
      type: "music",
      title: track.name || "Untitled",
      creator: (track.artists || []).map((artist) => artist.name).filter(Boolean).join(", ") || "Spotify",
      description: [track.album?.name, formatDuration(track.duration_ms)].filter(Boolean).join(" · ") || "Spotify track",
      imageUrl: image?.url || "",
      externalUrl: track.external_urls?.spotify || ""
    };
  });

  sendJson(response, 200, { ok: true, items });
}

async function handleStatic(request, response, url) {
  const pathname = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const normalized = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, normalized);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("Not a file");
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

const server = createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || `localhost:${port}`}`);

  handleRequest(request, response, url).catch((error) => {
    sendJson(response, 500, { error: "server-error", message: error.message });
  });
});

async function handleRequest(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/directions") {
    await handleDirections(request, response, url);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/local-search") {
    await handleLocalSearch(request, response, url);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/media-search") {
    await handleMediaSearch(request, response, url);
    return;
  }

  if (request.method === "GET" && url.pathname === "/favicon.ico") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET" && url.pathname === "/map-config.js") {
    response.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" });
    response.end(`window.NAVER_MAP_CONFIG = {
  ncpKeyId: ${JSON.stringify(naverMapsApiKeyId)},
  center: { lat: 37.54458, lng: 127.05592 },
  zoom: 15
};`);
    return;
  }

  if (request.method !== "GET") {
    response.writeHead(405, { Allow: "GET" });
    response.end("Method not allowed");
    return;
  }

  await handleStatic(request, response, url);
}

server.listen(port, () => {
  console.log(`Vehicle HMI prototype running at http://localhost:${port}`);
});
