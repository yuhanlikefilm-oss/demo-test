const { contextBridge } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const ROOT_DIR = __dirname;
const MAX_DEPTH = 4;
const IMAGE_EXT = /\.png$/i;

function walkDirs(dir, depth = 0, out = []) {
  if (depth > MAX_DEPTH) return out;
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }

  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.git')) continue;
      walkDirs(abs, depth + 1, out);
      continue;
    }
    if (entry.isFile() && IMAGE_EXT.test(entry.name)) {
      out.push(abs);
    }
  }
  return out;
}

function stateFromName(name) {
  const lower = name.toLowerCase();
  if (lower.startsWith('idle')) return 'idle';
  if (lower.startsWith('walk')) return 'walk';
  if (lower.startsWith('sleep')) return 'sleep';
  if (lower.startsWith('eat')) return 'eat';
  if (lower.startsWith('click-reaction') || lower.startsWith('click_reaction') || lower.startsWith('click')) return 'click';
  return null;
}

function frameOrderFromName(name) {
  const m = name.match(/(\d+)/g);
  if (!m || !m.length) return 0;
  return Number(m[m.length - 1]);
}

function discoverFrames() {
  const states = { idle: [], walk: [], sleep: [], eat: [], click: [] };
  const searchedRoot = ROOT_DIR;
  const scannedFiles = walkDirs(ROOT_DIR);

  for (const absFile of scannedFiles) {
    const base = path.basename(absFile);
    const state = stateFromName(base);
    if (!state) continue;
    states[state].push(absFile);
  }

  for (const key of Object.keys(states)) {
    states[key].sort((a, b) => frameOrderFromName(path.basename(a)) - frameOrderFromName(path.basename(b)));
    states[key] = states[key].map((p) => pathToFileURL(p).href);
  }

  return {
    ...states,
    searchedRoot,
    scannedCount: scannedFiles.length,
  };
}

contextBridge.exposeInMainWorld('petAssets', {
  discover: () => discoverFrames(),
});
