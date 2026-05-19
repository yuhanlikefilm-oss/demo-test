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

const CANDIDATE_FOLDERS = [
  'asset/husky',
  'assets/husky',
  'asset',
  'assets',
];

function showBubble(text, ms = 2400) {
  bubble.textContent = text;
  bubble.classList.add('show');
  clearTimeout(showBubble.timer);
  showBubble.timer = setTimeout(() => bubble.classList.remove('show'), ms);
}

function nowHour() {
  return new Date().getHours();
}

function reminderLine() {
  const h = nowHour();
  if (h >= 8 && h < 11) return '喝点水，再继续高效工作～';
  if (h >= 11 && h < 14) return '起身活动30秒，肩颈会舒服很多。';
  if (h >= 14 && h < 18) return '下午记得补水，也可以站一会儿。';
  if (h >= 18 && h < 23) return '晚上也别久坐，起来走两步。';
  return '夜深了，注意休息，别太晚。';
}

function loadImage(relativePath) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(relativePath));
    const abs = window.petPaths.resolveAsset(relativePath);
    img.src = `${abs}?v=${Date.now()}`;
  });
}

function buildCandidates(prefix, start, end) {
  const list = [];
  for (const folder of CANDIDATE_FOLDERS) {
    for (let i = start; i <= end; i += 1) {
      const padded = String(i).padStart(2, '0');
      list.push(`${folder}/${prefix}_${padded}.png`);
      list.push(`${folder}/${prefix}_${i}.png`);
    }
    list.push(`${folder}/${prefix}.png`);
  }
  return list;
}

async function loadStateFrames(prefix, rangeStart, rangeEnd) {
  const frames = [];
  const candidates = buildCandidates(prefix, rangeStart, rangeEnd);
  for (const src of candidates) {
    try {
      const img = await loadImage(src);
      frames.push(img);
    } catch {
      // continue
    }
  }
  return frames;
}

async function loadAllFrames() {
  loadedFrames.idle = await loadStateFrames('idle', 1, 8);
  loadedFrames.walk = await loadStateFrames('walk', 1, 8);
  loadedFrames.sleep = await loadStateFrames('sleep', 1, 8);
  loadedFrames.eat = await loadStateFrames('eat', 1, 8);
  loadedFrames.click = await loadStateFrames('click-reaction', 1, 8);

  if (!loadedFrames.idle.length) {
    showBubble('未找到 idle 序列，请检查 asset 或 asset/husky 文件名。', 4800);
  } else {
    showBubble(`素材加载成功：idle ${loadedFrames.idle.length} 帧`);
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

function moveWhileWalking() {
  if (state !== 'walk') return;
  xOffset += walkDirection * 1.6;
  if (xOffset > 28) walkDirection = -1;
  if (xOffset < -28) walkDirection = 1;
}

function drawPlaceholder() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(10, 45, 220, 100);
  ctx.fillStyle = '#222';
  ctx.font = '12px sans-serif';
  ctx.fillText('未加载到素材，请检查以下任一目录：', 20, 78);
  ctx.fillText('asset/ 或 asset/husky/', 20, 100);
  ctx.fillText('文件如: idle_01.png', 20, 122);
}

function draw(now) {
  requestAnimationFrame(draw);
  const frames = loadedFrames[state];
  if (!frames || !frames.length) {
    drawPlaceholder();
    return;
  }

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
  showBubble('收到摸摸！半小时后提醒你喝水。');
});

function randomBehavior() {
  const roll = Math.random();
  if (roll < 0.18) {
    setState('sleep', 5500);
    showBubble('我先眯一下，你也转转脖子～');
  } else if (roll < 0.55) {
    setState('walk', 3200);
    showBubble('巡逻中，你也起来走两步。');
  } else if (roll < 0.72) {
    setState('eat', 2600);
    showBubble('补充能量！你也喝一口水。');
  } else {
    setState('idle');
  }
}

requestAnimationFrame(draw);
loadAllFrames();
randomBehavior();
setInterval(randomBehavior, 18000);
setInterval(() => showBubble(reminderLine(), 3200), 30 * 60 * 1000);
