import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

async function loadEnvFile(filePath = join(root, "../.env")) {
  const contents = await readFile(filePath, "utf8");
  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  });
}

await loadEnvFile();

const naverMapsApiKeyId = process.env.NAVER_MAPS_API_KEY_ID;
const naverMapsApiKey = process.env.NAVER_MAPS_API_KEY;

console.log("Using API Key ID:", naverMapsApiKeyId);
console.log("Using API Key Secret:", naverMapsApiKey ? naverMapsApiKey.slice(0, 5) + "..." : "undefined");

const origin = "127.05592,37.54458"; // Seongsu-dong
const destination = "127.02758,37.49794"; // Gangnam

const directionsUrl = `https://maps.apigw.ntruss.com/map-direction/v1/driving?start=${origin}&goal=${destination}&option=traoptimal`;

try {
  const response = await fetch(directionsUrl, {
    headers: {
      "x-ncp-apigw-api-key-id": naverMapsApiKeyId,
      "x-ncp-apigw-api-key": naverMapsApiKey
    }
  });
  const payload = await response.json();
  console.log("Response Status:", response.status);
  console.log("Response Payload:", JSON.stringify(payload, null, 2));
} catch (error) {
  console.error("Request failed:", error);
}
