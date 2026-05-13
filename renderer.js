const canvas = document.getElementById('pet');
const ctx = canvas.getContext('2d');
const bubble = document.getElementById('bubble');
const pickButton = document.getElementById('pick-sheet');

const FRAME_W = 288;
const FRAME_H = 220;
const STATES = {
  idle: { row: 0, frames: 6, fps: 5 },
  walk: { row: 1, frames: 4, fps: 7 },
  sleep: { row: 2, frames: 4, fps: 2 },
  eat: { row: 3, frames: 4, fps: 4 },
  click: { row: 4, frames: 5, fps: 8 },
};

let sprite = null;
let state = 'idle';
let frame = 0;
let lastTick = 0;

const lines = ['汪！我来啦', '现在是散步时间~', '饿了就会去吃饭', '点我会有反应'];

function speak(text) {
  bubble.textContent = text;
  bubble.classList.add('show');
  clearTimeout(speak.timer);
  speak.timer = setTimeout(() => bubble.classList.remove('show'), 2600);
}

function setState(next, durationMs) {
  state = next;
  frame = 0;
  if (durationMs) setTimeout(() => (state = 'idle'), durationMs);
}

function loadSpriteFromUrl(fileUrl) {
  sprite = new Image();
  sprite.src = `${fileUrl}?t=${Date.now()}`;
  sprite.onload = () => speak('识别到 husky-sheet.png，形象已更新！');
  sprite.onerror = () => speak('图片加载失败，请确认文件可读。');
}

async function tryAutoLoadSprite() {
  const result = await window.petAPI.resolveHuskySheet();
  if (!result?.ok) {
    speak(`未找到素材，请放到 asset/ 或 assets/`);
    return;
  }
  loadSpriteFromUrl(result.fileUrl);
}

function draw(now) {
  requestAnimationFrame(draw);
  if (!sprite || !sprite.complete || !sprite.naturalWidth) return;
  const cfg = STATES[state];
  const interval = 1000 / cfg.fps;
  if (now - lastTick > interval) {
    frame = (frame + 1) % cfg.frames;
    lastTick = now;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(sprite, frame * FRAME_W, cfg.row * FRAME_H, FRAME_W, FRAME_H, 0, 0, canvas.width, canvas.height);
}

setInterval(() => {
  const roll = Math.random();
  if (roll < 0.2) setState('sleep', 5000);
  else if (roll < 0.55) setState('walk', 3200);
  else if (roll < 0.75) setState('eat', 2600);
  else setState('idle');
}, 7000);

setInterval(() => speak(lines[Math.floor(Math.random() * lines.length)]), 23000);
canvas.addEventListener('click', () => {
  setState('click', 1100);
  speak(lines[Math.floor(Math.random() * lines.length)]);
});

pickButton.addEventListener('click', async () => {
  const result = await window.petAPI.pickHuskySheet();
  if (result?.ok && result?.fileUrl) {
    loadSpriteFromUrl(result.fileUrl);
  }
});

requestAnimationFrame(draw);
tryAutoLoadSprite();
