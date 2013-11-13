'use strict';
// Configure the platform
var platform = {
  bops: require('bops-browser'),
  sha1: require('git-sha1'),
  tcp: require('websocket-tcp-client').tcp,
  tls: require('websocket-tcp-client').tls,
};
platform.http = require('git-http')(platform);

function get(key) {
  return JSON.parse(window.localStorage.getItem(key));
}

function set(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

// Configure the backend
var backend = require('./backend.js')({
  repo: require('js-git')(platform),
  remote: require('git-net')(platform),
  db: require('git-indexeddb')(platform),
  settings: { get: get, set: set }
});

window.git = backend;