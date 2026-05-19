const canvas = document.getElementById('pet');
const ctx = canvas.getContext('2d');
const bubble = document.getElementById('bubble');

const FRAME_SETS = {
  idle: ['asset/husky/idle.png'],
  walk: ['asset/husky/walk_01.png', 'asset/husky/walk_02.png'],
  sleep: ['asset/husky/sleep.png'],
  eat: ['asset/husky/eat.png'],
  click: ['asset/husky/click-reaction_01.png'],
};

const STATE_FPS = { idle: 2, walk: 5, sleep: 1, eat: 3, click: 6 };
const loadedFrames = {};

let state = 'idle';
let frameIndex = 0;
let lastTick = 0;
let walkDirection = 1;
let xOffset = 0;
let motionTimer;

function showBubble(text, ms = 2600) {
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
  if (h >= 8 && h < 11) return '上午好～喝几口水，继续冲！';
  if (h >= 11 && h < 14) return '中午啦，站起来活动1分钟。';
  if (h >= 14 && h < 18) return '下午容易累，记得补水和伸展。';
  if (h >= 18 && h < 23) return '晚上也别久坐，起来走两步～';
  return '夜深了，注意休息呀。';
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(src));
    img.src = `${src}?t=${Date.now()}`;
  });
}

async function loadAllFrames() {
  for (const key of Object.keys(FRAME_SETS)) {
    loadedFrames[key] = [];
    for (const src of FRAME_SETS[key]) {
      try {
        loadedFrames[key].push(await loadImage(src));
      } catch {
        // ignore missing frame
      }
    }
  }

  if (!loadedFrames.idle.length) {
    showBubble('未找到 asset/husky/idle.png，请检查文件名。', 4200);
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
  xOffset += walkDirection * 1.8;
  if (xOffset > 30) walkDirection = -1;
  if (xOffset < -30) walkDirection = 1;
}

function drawPlaceholder() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(255,255,255,0.86)';
  ctx.fillRect(20, 50, 200, 86);
  ctx.fillStyle = '#222';
  ctx.font = '12px sans-serif';
  ctx.fillText('等待素材: asset/husky/idle.png', 30, 95);
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
  showBubble('收到摸摸！记得喝水。');
});

function randomBehavior() {
  const roll = Math.random();
  if (roll < 0.18) {
    setState('sleep', 5500);
    showBubble('我先眯一会儿，你也放松下肩颈～');
  } else if (roll < 0.55) {
    setState('walk', 3200);
    showBubble('散步巡逻中...你也起来走走吧。');
  } else if (roll < 0.72) {
    setState('eat', 2600);
    showBubble('补充能量！你也喝口水。');
  } else {
    setState('idle');
  }
}

requestAnimationFrame(draw);
loadAllFrames();
randomBehavior();
motionTimer = setInterval(randomBehavior, 9000);
setInterval(() => showBubble(reminderLine(), 3000), 60000);
