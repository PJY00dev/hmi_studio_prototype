const NAVER_DEFAULT_CENTER = {
  lat: 37.54458,
  lng: 127.05592
};

const NAVER_DEFAULT_ZOOM = 15;
const NAVER_KEY_PLACEHOLDER = "YOUR_NCP_KEY_ID";
const NAVER_SDK_BASE_URL = "https://oapi.map.naver.com/openapi/v3/maps.js";
const NAVER_DIRECTIONS_URL = "https://maps.apigw.ntruss.com/map-direction/v1/driving";
const NAVER_LOCAL_SEARCH_URL = "https://openapi.naver.com/v1/search/local.json";
const NAVER_GEOCODE_URL = "https://maps.apigw.ntruss.com/map-geocode/v2/geocode";

export function isValidNaverMapKey(value) {
  const key = String(value || "").trim();
  return Boolean(key) && key !== NAVER_KEY_PLACEHOLDER;
}

export function normalizeNaverMapConfig(config = {}) {
  const center = config.center || {};
  return {
    ncpKeyId: String(config.ncpKeyId || "").trim(),
    center: {
      lat: Number.isFinite(Number(center.lat)) ? Number(center.lat) : NAVER_DEFAULT_CENTER.lat,
      lng: Number.isFinite(Number(center.lng)) ? Number(center.lng) : NAVER_DEFAULT_CENTER.lng
    },
    zoom: Number.isFinite(Number(config.zoom)) ? Number(config.zoom) : NAVER_DEFAULT_ZOOM
  };
}

export function toNaverMapsSdkUrl(ncpKeyId) {
  return `${NAVER_SDK_BASE_URL}?ncpKeyId=${encodeURIComponent(ncpKeyId)}&submodules=gl&v=20260608052747`;
}

export function toNaverCompatibleLocalUrl(href) {
  const url = new URL(href);
  if (url.hostname === "127.0.0.1") {
    url.hostname = "localhost";
  }
  return url.toString();
}

export function getNaverMapFailureMessage(reason) {
  const messages = {
    "missing-key": "Add your Naver Maps ncpKeyId in map-config.js.",
    "sdk-load": "Naver map could not load. Check the ncpKeyId and registered Web service URL.",
    "geocoder-unavailable": "Naver Geocoding is unavailable. Enable Geocoding for this Maps application.",
    "search-empty": "Enter an address or road name.",
    "local-search-key": "Set NAVER_SEARCH_CLIENT_ID and NAVER_SEARCH_CLIENT_SECRET before searching places.",
    "directions-key": "Set NAVER_MAPS_API_KEY_ID and NAVER_MAPS_API_KEY before requesting routes.",
    "search-failed": "Address search failed.",
    "search-empty-result": "No address found."
  };

  return messages[reason] || messages["sdk-load"];
}

function formatPoint(point) {
  return `${Number(point.lng)},${Number(point.lat)}`;
}

export function buildNaverDirectionsUrl({ origin, destination, option = "traoptimal" }) {
  const url = new URL(NAVER_DIRECTIONS_URL);
  url.searchParams.set("start", formatPoint(origin));
  url.searchParams.set("goal", formatPoint(destination));
  url.searchParams.set("option", option);
  url.searchParams.set("cartype", "1");
  return url;
}

export function buildNaverLocalSearchUrl({ query, display = 5, sort = "random" }) {
  const url = new URL(NAVER_LOCAL_SEARCH_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("display", String(display));
  url.searchParams.set("start", "1");
  url.searchParams.set("sort", sort);
  return url;
}

export function buildNaverGeocodeUrl({ query, count = 5 }) {
  const url = new URL(NAVER_GEOCODE_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("count", String(count));
  return url;
}

export function formatRouteDistance(distance) {
  const meters = Number(distance) || 0;
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(duration) {
  const minutes = Math.max(1, Math.round((Number(duration) || 0) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

export function normalizeNaverLocalSearchItem(item = {}) {
  const rawLng = Number(item.mapx);
  const rawLat = Number(item.mapy);
  const lng = Math.abs(rawLng) > 180 ? rawLng / 10000000 : rawLng;
  const lat = Math.abs(rawLat) > 90 ? rawLat / 10000000 : rawLat;

  return {
    name: String(item.title || "").replace(/<[^>]*>/g, ""),
    category: item.category || "",
    roadAddress: item.roadAddress || "",
    address: item.address || "",
    lng,
    lat
  };
}

export function extractNaverRoute(payload) {
  const routes = extractMultipleNaverRoutes(payload);
  return routes[0];
}

export function extractMultipleNaverRoutes(payload) {
  const routes = payload?.route || {};

  // Try to find raw routes from NCP payload
  const rawOptimal = routes.traoptimal?.[0];
  const rawFast = routes.trafast?.[0];
  const rawComfort = routes.tracomfort?.[0];

  const baseRoute = rawOptimal || rawFast || rawComfort || Object.values(routes)[0]?.[0];
  if (!baseRoute?.summary) {
    throw new Error(payload?.message || "Naver route was not found.");
  }

  const formattedBase = parseSingleRoute(baseRoute);

  // Route 1: 추천 (Recommended)
  const route1 = {
    ...formattedBase,
    id: "recommended",
    name: "추천",
    autonomousPct: 98,
    batteryEstimate: 95,
    batteryRoundTrip: 89,
    description: "실시간 교통을 반영한 최적 경로입니다."
  };

  // Route 2: 자율주행 우선 (Autonomous First)
  let route2;
  if (rawFast) {
    route2 = {
      ...parseSingleRoute(rawFast),
      id: "autonomous",
      name: "자율주행 우선",
      autonomousPct: 99,
      batteryEstimate: 95,
      batteryRoundTrip: 88,
      description: "자율주행 최적화 및 정밀 도로 위주 경로입니다."
    };
  } else {
    // Generate simulated alternative with minor parallel offset
    const path2 = offsetPath(formattedBase.path, 0.00022);
    route2 = {
      ...formattedBase,
      id: "autonomous",
      name: "자율주행 우선",
      duration: Math.round(formattedBase.duration * 1.05),
      durationText: formatDuration(formattedBase.duration * 1.05),
      distance: Math.round(formattedBase.distance * 0.97),
      distanceText: formatRouteDistance(formattedBase.distance * 0.97),
      path: path2,
      autonomousPct: 99,
      batteryEstimate: 95,
      batteryRoundTrip: 88,
      description: "자율주행 최적화 및 정밀 도로 위주 경로입니다."
    };
  }

  // Route 3: 고속도로 우선 (Highway First)
  let route3;
  if (rawComfort) {
    route3 = {
      ...parseSingleRoute(rawComfort),
      id: "highway",
      name: "고속도로 우선",
      autonomousPct: 98,
      batteryEstimate: 95,
      batteryRoundTrip: 89,
      description: "고속도로 및 도시고속도로 우선 경로입니다."
    };
  } else {
    // Generate simulated alternative with opposite parallel offset
    const path3 = offsetPath(formattedBase.path, -0.00022);
    const duration3 = Math.round(formattedBase.duration * 0.90);
    route3 = {
      ...formattedBase,
      id: "highway",
      name: "고속도로 우선",
      duration: duration3,
      durationText: formatDuration(duration3),
      distance: Math.round(formattedBase.distance * 1.03),
      distanceText: formatRouteDistance(formattedBase.distance * 1.03),
      taxiFare: formattedBase.taxiFare + 1200,
      path: path3,
      autonomousPct: 98,
      batteryEstimate: 95,
      batteryRoundTrip: 89,
      description: "고속도로 및 도시고속도로 우선 경로입니다."
    };
  }

  // Route 4: 무료도로 우선 (Free Road First)
  const path4 = offsetPath(formattedBase.path, 0.00044);
  const route4 = {
    ...formattedBase,
    id: "free",
    name: "무료도로 우선",
    duration: Math.round(formattedBase.duration * 1.15),
    durationText: formatDuration(formattedBase.duration * 1.15),
    distance: Math.round(formattedBase.distance * 1.08),
    distanceText: formatRouteDistance(formattedBase.distance * 1.08),
    taxiFare: 700,
    path: path4,
    autonomousPct: 99,
    batteryEstimate: 94,
    batteryRoundTrip: 94,
    description: "통행료가 발생하지 않는 무료 도로 우선 경로입니다."
  };

  // Route 5: 어린이안심 (Kid Safe)
  const path5 = offsetPath(formattedBase.path, -0.00044);
  const route5 = {
    ...formattedBase,
    id: "kidsafe",
    name: "어린이안심",
    duration: Math.round(formattedBase.duration * 1.00),
    durationText: formatDuration(formattedBase.duration * 1.00),
    distance: Math.round(formattedBase.distance * 1.00),
    distanceText: formatRouteDistance(formattedBase.distance * 1.00),
    taxiFare: formattedBase.taxiFare,
    path: path5,
    autonomousPct: 98,
    batteryEstimate: 95,
    batteryRoundTrip: 89,
    description: "어린이 보호구역 및 안전 운행 구간 위주 경로입니다."
  };

  return [route1, route2, route3, route4, route5];
}

function parseSingleRoute(route) {
  return {
    distance: route.summary.distance,
    distanceText: formatRouteDistance(route.summary.distance),
    duration: route.summary.duration,
    durationText: formatDuration(route.summary.duration),
    taxiFare: route.summary.taxiFare || 0,
    tollFare: route.summary.tollFare || 0,
    fuelPrice: route.summary.fuelPrice || 0,
    path: (route.path || []).map(([lng, lat]) => ({ lng, lat })),
    guides: (route.guide || []).map((guide) => ({
      name: guide.instructions || "Continue",
      distance: guide.distance || 0,
      duration: guide.duration || 0,
      type: guide.type
    })),
    sections: (route.section || []).map((sec) => ({
      pointIndex: sec.pointIndex,
      pointCount: sec.pointCount,
      congestion: sec.congestion,
      speed: sec.speed
    }))
  };
}

function offsetPath(points, shift) {
  if (points.length < 3) return points;
  const len = points.length;
  return points.map((p, i) => {
    if (i === 0 || i === len - 1) return p;
    // Apply parallel offset perpendicular to the line segment
    const next = points[i + 1] || p;
    const dx = next.lng - p.lng;
    const dy = next.lat - p.lat;
    const norm = Math.sqrt(dx * dx + dy * dy) || 1;
    // Perpendicular vector
    const px = -dy / norm;
    const py = dx / norm;
    // Scale offset to 0 at the ends using a sine wave
    const scale = Math.sin((i / (len - 1)) * Math.PI);
    return {
      lng: p.lng + px * shift * scale,
      lat: p.lat + py * shift * scale
    };
  });
}
