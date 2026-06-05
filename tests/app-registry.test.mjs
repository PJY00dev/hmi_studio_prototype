import assert from "node:assert/strict";
import test from "node:test";

import {
  ALL_APPS,
  APP_REGISTRY,
  APP_SETTING_APPS,
  EDIT_APPS,
  MEDIA_APP_META,
  appDisplayMetaById,
  launcherAppMetaById
} from "../app-registry.js";

test("derives launcher, edit, settings, and media app data from one app registry", () => {
  const launcherIds = APP_REGISTRY.filter((app) => app.surfaces?.launcher).map((app) => app.id);
  const editIds = APP_REGISTRY.filter((app) => app.surfaces?.edit).map((app) => app.id);
  const settingsIds = APP_REGISTRY
    .filter((app) => app.settings)
    .map((app) => app.settings.id || app.id);

  assert.deepEqual(ALL_APPS.map((app) => app.appId), launcherIds);
  assert.deepEqual(EDIT_APPS, editIds);
  assert.deepEqual(APP_SETTING_APPS.map((app) => app.id), settingsIds);
  assert.deepEqual(Object.keys(MEDIA_APP_META), ["youtube", "spotify"]);
});

test("uses the same icon, title, and color metadata for shared app surfaces", () => {
  const spotify = APP_REGISTRY.find((app) => app.id === "spotify");
  const launcherSpotify = launcherAppMetaById("spotify");
  const displaySpotify = appDisplayMetaById("spotify");

  assert.equal(launcherSpotify.title, spotify.title);
  assert.equal(launcherSpotify.icon, spotify.icon);
  assert.equal(launcherSpotify.color, spotify.color);
  assert.equal(displaySpotify.title, spotify.title);
  assert.equal(displaySpotify.icon, spotify.icon);
  assert.equal(displaySpotify.color, spotify.color);
});
