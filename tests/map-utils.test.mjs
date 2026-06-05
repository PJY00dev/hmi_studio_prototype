import assert from "node:assert/strict";
import test from "node:test";

import {
  buildNaverDirectionsUrl,
  buildNaverLocalSearchUrl,
  extractNaverRoute,
  formatDuration,
  formatRouteDistance,
  getNaverMapFailureMessage,
  isValidNaverMapKey,
  normalizeNaverLocalSearchItem,
  normalizeNaverMapConfig,
  toNaverMapsSdkUrl
} from "../map-utils.js";

test("rejects placeholder or blank Naver map keys", () => {
  assert.equal(isValidNaverMapKey(""), false);
  assert.equal(isValidNaverMapKey("   "), false);
  assert.equal(isValidNaverMapKey("YOUR_NCP_KEY_ID"), false);
  assert.equal(isValidNaverMapKey("real-client-id"), true);
});

test("normalizes map config with local defaults", () => {
  assert.deepEqual(normalizeNaverMapConfig({ ncpKeyId: " abc123 " }), {
    ncpKeyId: "abc123",
    center: { lat: 37.54458, lng: 127.05592 },
    zoom: 15
  });
});

test("builds an SDK URL with geocoder and gl submodules", () => {
  assert.equal(
    toNaverMapsSdkUrl("client id/with spaces"),
    "https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=client%20id%2Fwith%20spaces&submodules=geocoder,gl"
  );
});

test("returns clear map failure copy", () => {
  assert.match(getNaverMapFailureMessage("missing-key"), /map-config\.js/);
  assert.match(getNaverMapFailureMessage("sdk-load"), /Web service URL/);
  assert.match(getNaverMapFailureMessage("geocoder-unavailable"), /Geocoding/);
  assert.match(getNaverMapFailureMessage("local-search-key"), /NAVER_SEARCH_CLIENT_ID/);
  assert.match(getNaverMapFailureMessage("directions-key"), /NAVER_MAPS_API_KEY_ID/);
});

test("builds Naver Directions 5 URL", () => {
  const url = buildNaverDirectionsUrl({
    origin: { lng: 127.05592, lat: 37.54458 },
    destination: { lng: 127.02758, lat: 37.49794 }
  });

  assert.equal(url.origin, "https://maps.apigw.ntruss.com");
  assert.equal(url.pathname, "/map-direction/v1/driving");
  assert.equal(url.searchParams.get("start"), "127.05592,37.54458");
  assert.equal(url.searchParams.get("goal"), "127.02758,37.49794");
  assert.equal(url.searchParams.get("option"), "traoptimal");
});

test("builds Naver local search URL", () => {
  const url = buildNaverLocalSearchUrl({ query: "성수역" });
  assert.equal(url.origin, "https://openapi.naver.com");
  assert.equal(url.pathname, "/v1/search/local.json");
  assert.equal(url.searchParams.get("query"), "성수역");
  assert.equal(url.searchParams.get("display"), "5");
});

test("normalizes Naver local search result coordinates", () => {
  assert.deepEqual(
    normalizeNaverLocalSearchItem({
      title: "<b>성수역</b>",
      category: "교통",
      roadAddress: "서울 성동구 아차산로",
      mapx: "1270559200",
      mapy: "375445800"
    }),
    {
      name: "성수역",
      category: "교통",
      roadAddress: "서울 성동구 아차산로",
      address: "",
      lng: 127.05592,
      lat: 37.54458
    }
  );
});

test("formats Naver route distance and duration", () => {
  assert.equal(formatRouteDistance(850), "850 m");
  assert.equal(formatRouteDistance(12840), "12.8 km");
  assert.equal(formatDuration(540000), "9 min");
  assert.equal(formatDuration(4380000), "1 hr 13 min");
});

test("extracts summary, polyline, and turn guides from Naver route response", () => {
  const route = extractNaverRoute({
    route: {
      traoptimal: [
        {
          summary: {
            distance: 12840,
            duration: 1860000,
            taxiFare: 18200,
            tollFare: 0
          },
          path: [
            [127.1, 37.1],
            [127.2, 37.2]
          ],
          guide: [
            { instructions: "우회전", distance: 150, duration: 40000 },
            { instructions: "도착", distance: 0, duration: 0 }
          ]
        }
      ]
    }
  });

  assert.equal(route.distanceText, "12.8 km");
  assert.equal(route.durationText, "31 min");
  assert.equal(route.taxiFare, 18200);
  assert.deepEqual(route.path, [
    { lng: 127.1, lat: 37.1 },
    { lng: 127.2, lat: 37.2 }
  ]);
  assert.equal(route.guides.length, 2);
});
