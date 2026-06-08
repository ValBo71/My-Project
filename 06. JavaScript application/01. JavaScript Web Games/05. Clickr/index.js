const TIMEOUT = 5000;

let clicks = 0;

const display = document.querySelector('#display');
const button = document.querySelector('#button');
const counter = document.querySelector('#counter');

button.onclick = start;

function start() {
  clicks = 0;
  counter.textContent = clicks;
  const startTime = Date.now();

  display.textContent = formatTime(TIMEOUT);
  button.onclick = () => {
    clicks++;
    counter.textContent = clicks;
  };

  const interval = setInterval(() => {
    const delta = Date.now() - startTime;
    const remaining = TIMEOUT - delta;
    display.textContent = formatTime(remaining > 0 ? remaining : 0);
  }, 100);

  const timeout = setTimeout(() => {
    button.onclick = start;
    display.textContent = 'Game Over';

    clearInterval(interval);
    clearTimeout(timeout);
  }, TIMEOUT);
}

function formatTime(ms) {
  return Number.parseFloat(ms / 1000).toFixed(2);
}