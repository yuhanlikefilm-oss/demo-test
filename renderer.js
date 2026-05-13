const pet = document.getElementById('pet');
const bubble = document.getElementById('bubble');

const lines = [
  '汪～我在陪你工作。',
  '蓝眼哈士奇申请摸摸！',
  '我想出去散步了～',
  '辛苦啦，记得喝水。'
];

function talkRandom() {
  bubble.textContent = lines[Math.floor(Math.random() * lines.length)];
  pet.classList.add('talking');
  setTimeout(() => pet.classList.remove('talking'), 2600);
}

setInterval(talkRandom, 20000);
pet.addEventListener('click', talkRandom);
