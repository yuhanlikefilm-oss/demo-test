const canvas = document.getElementById('pet');
const ctx = canvas.getContext('2d');
const bubble = document.getElementById('bubble');

const FRAME_SETS = {
  idle: ['asset/husky/idle.png'],
  walk: ['asset/husky/walk_01.png', 'asset/husky/walk_02.png'],
  sleep: ['asset/husky/sleep.png'],
  eat: ['asset/husky/eat.png'],
  click: ['asset/husky/click-reaction_01.png', 'asset/husky/click-reaction_01.png'],
};

const STATE_FPS = {
  idle: 2,
  walk: 5,
  sleep: 1,
  eat: 3,
  click: 6,
};

const loadedFrames = {};
let state = 'idle';
let frameIndex = 0;
let lastTick = 0;

const lines = ['我在任务栏等你右键~', '要散步啦！', '摸摸我～', '工作辛苦了'];

function speak(text) {
  bubble.textContent = text;
  bubble.classList.add('show');
  clearTimeout(speak.timer);
  speak.timer = setTimeout(() => bubble.classList.remove('show'), 2200);
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
  const states = Object.keys(FRAME_SETS);
  for (const s of states) {
    loadedFrames[s] = [];
    for (const src of FRAME_SETS[s]) {
      try {
        const img = await loadImage(src);
        loadedFrames[s].push(img);
      } catch {
        // skip missing frame
      }
    }
  }

  if (!loadedFrames.idle.length) {
    speak('未找到 asset/husky/idle.png');
  } else {
    speak('素材加载成功，已切换为你的文件命名规则。');
  }
}

function setState(next, durationMs) {
  if (!loadedFrames[next]?.length) return;
  state = next;
  frameIndex = 0;
  if (durationMs) {
    setTimeout(() => {
      state = loadedFrames.walk?.length && Math.random() > 0.5 ? 'walk' : 'idle';
      frameIndex = 0;
    }, durationMs);
  }
}

function draw(now) {
  requestAnimationFrame(draw);
  const frames = loadedFrames[state];
  if (!frames || !frames.length) return;

  const interval = 1000 / STATE_FPS[state];
  if (now - lastTick > interval) {
    frameIndex = (frameIndex + 1) % frames.length;
    lastTick = now;
  }

  const img = frames[frameIndex];
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = (canvas.width - dw) / 2;
  const dy = canvas.height - dh;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, dx, dy, dw, dh);
}

canvas.addEventListener('click', () => {
  setState('click', 1200);
  speak(lines[Math.floor(Math.random() * lines.length)]);
});

setInterval(() => {
  const roll = Math.random();
  if (roll < 0.2) setState('sleep', 4500);
  else if (roll < 0.55) setState('walk', 2600);
  else if (roll < 0.75) setState('eat', 2400);
  else setState('idle');
}, 6000);

setInterval(() => speak(lines[Math.floor(Math.random() * lines.length)]), 25000);

requestAnimationFrame(draw);
loadAllFrames();
