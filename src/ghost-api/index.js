const GhostContentAPI = require("@tryghost/content-api");
const GhostAdminAPI = require("@tryghost/admin-api");

const contentAPI = new GhostContentAPI({
  url: "http://localhost:2368",
  key: "581324f4c311f7eb159425c076",
  version: "v4",
});

const adminAPI = new GhostAdminAPI({
  url: "http://localhost:2368",
  key: "61792a3c9dd7d5265fd85c2a:16b26d9e1ea4206a6ef41d10e1e3b2310b9edc70e6ccce65deb47b6b1a9700af",
  version: "v4",
});

exports.ContentAPI = contentAPI;
exports.AdminAPI = adminAPI;
