const { contextBridge } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const CANDIDATE_DIRS = ['asset/husky', 'assets/husky', 'asset', 'assets'];

function buildCandidates(prefix) {
  const out = [];
  for (const dir of CANDIDATE_DIRS) {
    for (let i = 1; i <= 12; i += 1) {
      const p2 = String(i).padStart(2, '0');
      out.push(path.join(__dirname, dir, `${prefix}_${p2}.png`));
      out.push(path.join(__dirname, dir, `${prefix}_${i}.png`));
    }
    out.push(path.join(__dirname, dir, `${prefix}.png`));
  }
  return out;
}

function findFrames(prefix) {
  const files = [];
  const seen = new Set();
  for (const absPath of buildCandidates(prefix)) {
    if (!seen.has(absPath) && fs.existsSync(absPath)) {
      seen.add(absPath);
      files.push(pathToFileURL(absPath).href);
    }
  }
  return files;
}

contextBridge.exposeInMainWorld('petAssets', {
  discover: () => ({
    idle: findFrames('idle'),
    walk: findFrames('walk'),
    sleep: findFrames('sleep'),
    eat: findFrames('eat'),
    click: findFrames('click-reaction'),
    searchedDirs: CANDIDATE_DIRS.map((d) => path.join(__dirname, d)),
  }),
});
