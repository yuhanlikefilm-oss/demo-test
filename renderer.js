const canvas = document.getElementById('pet');
const ctx = canvas.getContext('2d');
const bubble = document.getElementById('bubble');

const STATE_FPS = { idle: 3, walk: 6, sleep: 2, eat: 4, click: 8 };
const loadedFrames = {};

let state = 'idle';
let frameIndex = 0;
let lastTick = 0;
let walkDirection = 1;
let xOffset = 0;
let debugInfo = null;

function showBubble(text, ms = 2600) {
  bubble.textContent = text;
  bubble.classList.add('show');
  clearTimeout(showBubble.timer);
  showBubble.timer = setTimeout(() => bubble.classList.remove('show'), ms);
}

function loadUrlImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(url));
    img.src = `${url}?v=${Date.now()}`;
  });
}

async function loadFramesFromUrls(urls) {
  const arr = [];
  for (const u of urls) {
    try {
      arr.push(await loadUrlImage(u));
    } catch {
      // ignore bad file
    }
  }
  return arr;
}

async function loadAllFrames() {
  const manifest = window.petAssets.discover();
  debugInfo = [
    `root: ${manifest.searchedRoot}`,
    `scanned png: ${manifest.scannedCount}`,
    `idle:${manifest.idle.length} walk:${manifest.walk.length}`,
    `sleep:${manifest.sleep.length} eat:${manifest.eat.length} click:${manifest.click.length}`,
  ];

  loadedFrames.idle = await loadFramesFromUrls(manifest.idle);
  loadedFrames.walk = await loadFramesFromUrls(manifest.walk);
  loadedFrames.sleep = await loadFramesFromUrls(manifest.sleep);
  loadedFrames.eat = await loadFramesFromUrls(manifest.eat);
  loadedFrames.click = await loadFramesFromUrls(manifest.click);

  if (!loadedFrames.idle.length) {
    showBubble('未识别到 idle。请确认图片在项目目录内且前缀为 idle。', 5500);
    console.warn('asset discovery manifest:', manifest);
  } else {
    showBubble(`加载成功：idle ${loadedFrames.idle.length} 帧`);
  }
}

function setState(next, durationMs) {
  if (!loadedFrames[next]?.length) return;
  state = next;
  frameIndex = 0;
  clearTimeout(setState.timer);
  if (durationMs) {
    setState.timer = setTimeout(() => {
      state = loadedFrames.walk.length ? 'walk' : 'idle';
      frameIndex = 0;
    }, durationMs);
  }
}

function drawPlaceholder() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillRect(8, 26, 224, 138);
  ctx.fillStyle = '#222';
  ctx.font = '11px sans-serif';
  ctx.fillText('未识别到可用帧（已启用全项目扫描）', 14, 44);
  if (debugInfo) {
    let y = 62;
    for (const line of debugInfo) {
      const txt = line.length > 33 ? `${line.slice(0, 33)}...` : line;
      ctx.fillText(txt, 14, y);
      y += 16;
    }
  }
}

function moveWhileWalking() {
  if (state !== 'walk') return;
  xOffset += walkDirection * 1.6;
  if (xOffset > 28) walkDirection = -1;
  if (xOffset < -28) walkDirection = 1;
}

function draw(now) {
  requestAnimationFrame(draw);
  const frames = loadedFrames[state];
  if (!frames || !frames.length) return drawPlaceholder();

  const interval = 1000 / STATE_FPS[state];
  if (now - lastTick > interval) {
    frameIndex = (frameIndex + 1) % frames.length;
    lastTick = now;
    moveWhileWalking();
  }

  const img = frames[frameIndex];
  const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = (canvas.width - dw) / 2 + xOffset;
  const dy = canvas.height - dh;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, dx, dy, dw, dh);
}

canvas.addEventListener('click', () => {
  setState('click', 1200);
  showBubble('收到摸摸！记得每半小时活动一下～');
});

function randomBehavior() {
  const roll = Math.random();
  if (roll < 0.18) setState('sleep', 5500);
  else if (roll < 0.55) setState('walk', 3200);
  else if (roll < 0.72) setState('eat', 2600);
  else setState('idle');
}

requestAnimationFrame(draw);
loadAllFrames();
randomBehavior();
setInterval(randomBehavior, 18000);
setInterval(() => showBubble('喝口水并起身活动30秒～', 3200), 30 * 60 * 1000);
