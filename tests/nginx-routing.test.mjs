import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const config = readFileSync(
  new URL("../deploy/nginx-olegshokin.conf", import.meta.url),
  "utf8",
);
// Structural regression coverage for environments without nginx. Preserve nginx's
// ordered regex matching, after exact matches and before ordinary prefixes.
const locations = [...config.matchAll(
  /location\s+(?:(=|~\*|\^~|~)\s+)?(\S+)\s*\{([^}]+)\}/g,
)].map(([, modifier, path, body]) => ({ modifier, path, body }));
function route(uri) {
  const exact = locations.find((l) => l.modifier === "=" && l.path === uri);
  if (exact) return exact.body;
  const prefix = locations
    .filter((l) => (!l.modifier || l.modifier === "^~") && uri.startsWith(l.path))
    .sort((a, b) => b.path.length - a.path.length)[0];
  if (prefix?.modifier === "^~") return prefix.body;
  return locations.find((l) =>
    (l.modifier === "~" || l.modifier === "~*") &&
    new RegExp(l.path, l.modifier === "~*" ? "i" : "").test(uri)
  )?.body ?? prefix?.body;
}

test("static files bypass page limits and cannot fall back to HTML", () => {
  for (const uri of [
    "/play/js/game.js", "/play/css/game.css", "/site/js/site.js",
    "/shared/css/tokens.css", "/assets/game/audio/background-music.m4a",
    "/assets/game/audio/player-jump.mp3", "/missing.js", "/missing.CSS",
    "/assets/missing.unknown", "/site/missing.unknown",
    "/shared/missing", "/play/js/missing.unknown", "/play/css/missing",
  ]) {
    const body = route(uri);
    assert.match(body, /try_files \$uri =404;/, uri);
    assert.match(body, /expires 7d;/, uri);
    assert.doesNotMatch(body, /limit_req|index\.html/, uri);
  }
});

test("hidden files take precedence over static routing", () => {
  for (const uri of ["/.env", "/play/.secret.js", "/play/js/.env",
    "/assets/.git/config", "/site/.hidden.css", "/shared/.secret"]) {
    assert.match(route(uri), /deny all;/, uri);
  }
});

test("pages retain rate limits, fallback routes, redirect and security settings", () => {
  assert.match(route("/play"), /return 301 \/play\/;/);
  for (const uri of ["/play/", "/play/level"]) {
    assert.match(route(uri), /limit_req zone=oshokin_pages burst=20 nodelay;/);
    assert.match(route(uri), /try_files \$uri \$uri\/ \/play\/index\.html;/);
  }
  assert.match(route("/"), /try_files \$uri \$uri\/ \/index\.html;/);
  assert.match(route("/"), /limit_req zone=oshokin_pages/);
  assert.match(config, /root \/srv\/digital-development-simulator\/current;/);
  for (const header of ["X-Content-Type-Options", "Referrer-Policy",
    "X-Frame-Options", "Content-Security-Policy"]) {
    assert.match(config, new RegExp(`add_header ${header} .+ always;`));
  }
});
