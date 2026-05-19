const canvas = document.getElementById('pet');
const ctx = canvas.getContext('2d');
const bubble = document.getElementById('bubble');

const FRAME_SETS = {
  idle: ['asset/husky/idle.png', 'assets/husky/idle.png'],
  walk: ['asset/husky/walk_01.png', 'asset/husky/walk_02.png', 'assets/husky/walk_01.png', 'assets/husky/walk_02.png'],
  sleep: ['asset/husky/sleep.png', 'assets/husky/sleep.png'],
  eat: ['asset/husky/eat.png', 'assets/husky/eat.png'],
  click: ['asset/husky/click-reaction_01.png', 'assets/husky/click-reaction_01.png'],
};

const STATE_FPS = { idle: 2, walk: 5, sleep: 1, eat: 3, click: 6 };
const loadedFrames = {};

let state = 'idle';
let frameIndex = 0;
let lastTick = 0;
let walkDirection = 1;
let xOffset = 0;

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

async function loadFirstAvailable(candidates) {
  for (const candidate of candidates) {
    try {
      return await loadImage(candidate);
    } catch {
      // try next
    }
  }
  return null;
}

async function loadAllFrames() {
  for (const key of Object.keys(FRAME_SETS)) {
    loadedFrames[key] = [];
    if (key === 'walk') {
      const walk1 = await loadFirstAvailable([FRAME_SETS.walk[0], FRAME_SETS.walk[2]]);
      const walk2 = await loadFirstAvailable([FRAME_SETS.walk[1], FRAME_SETS.walk[3]]);
      if (walk1) loadedFrames.walk.push(walk1);
      if (walk2) loadedFrames.walk.push(walk2);
      continue;
    }

    const img = await loadFirstAvailable(FRAME_SETS[key]);
    if (img) loadedFrames[key].push(img);
  }

  if (!loadedFrames.idle.length) {
    showBubble('未找到 idle.png，请检查 asset/husky 或 assets/husky。', 4500);
  } else {
    showBubble('素材加载成功，哈士奇已上线！');
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
  ctx.fillStyle = 'rgba(255,255,255,0.86)';
  ctx.fillRect(18, 52, 208, 84);
  ctx.fillStyle = '#222';
  ctx.font = '12px sans-serif';
  ctx.fillText('等待素材: asset/husky/idle.png', 28, 92);
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
