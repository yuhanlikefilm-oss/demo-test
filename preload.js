const { contextBridge } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const CANDIDATE_DIRS = ['asset/husky', 'assets/husky', 'asset', 'assets'];

function safeReadDir(absDir) {
  try {
    return fs.readdirSync(absDir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function discoverDir(absDir) {
  const files = [];
  const entries = safeReadDir(absDir);
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.toLowerCase().endsWith('.png')) continue;
    files.push(path.join(absDir, entry.name));
  }
  return files;
}

function stateFromName(name) {
  const lower = name.toLowerCase();
  if (/^idle(?:_|\.)/.test(lower)) return 'idle';
  if (/^walk(?:_|\.)/.test(lower)) return 'walk';
  if (/^sleep(?:_|\.)/.test(lower)) return 'sleep';
  if (/^eat(?:_|\.)/.test(lower)) return 'eat';
  if (/^click-reaction(?:_|\.)/.test(lower)) return 'click';
  return null;
}

function frameOrderFromName(name) {
  const m = name.match(/_(\d+)\.png$/i);
  return m ? Number(m[1]) : 0;
}

function discoverFrames() {
  const states = { idle: [], walk: [], sleep: [], eat: [], click: [] };
  const searchedDirs = [];

  for (const relDir of CANDIDATE_DIRS) {
    const absDir = path.join(__dirname, relDir);
    searchedDirs.push(absDir);
    const files = discoverDir(absDir);
    for (const absFile of files) {
      const state = stateFromName(path.basename(absFile));
      if (!state) continue;
      states[state].push(absFile);
    }
  }

  for (const key of Object.keys(states)) {
    states[key].sort((a, b) => frameOrderFromName(path.basename(a)) - frameOrderFromName(path.basename(b)));
    states[key] = states[key].map((p) => pathToFileURL(p).href);
  }

  return { ...states, searchedDirs };
}

contextBridge.exposeInMainWorld('petAssets', {
  discover: () => discoverFrames(),
});
