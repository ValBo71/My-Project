# 🦖 Dino Jump Game

A lightweight, endless runner web game inspired by the famous Google Chrome offline dinosaur game, built with Vanilla HTML, CSS, and JavaScript.

## 🎮 How to Play

1. Open `index.html` in your web browser.
2. Press any key on your keyboard to make the dinosaur jump.
3. Time your jumps to hop over the incoming cactus obstacles.
4. If the dinosaur collides with a cactus, the game is over.

## ⌨️ Controls

- **Press Any Key**: Jump

## 🛠️ Technical Details & Refactoring

- **CSS Animations**: Utilizes a repeating `@keyframes` translation loop to move the cactus from right to left, and a linear `@keyframes` jump transition to animate the dinosaur's vertical arc.
- **Collision Checking Loop**: Checks for overlaps every `10ms` using `window.getComputedStyle` to compare the `top` position of the dinosaur and the `left` position of the cactus.
- **Infinite Alert Loop Fix**: Previously, colliding with a cactus triggered a repeating alert box because the check loop continued to run after a collision. The code has been refactored to cleanly clear the check interval, stop the cactus animation (`cactus.style.animation = "none"`), show a single **"GAME OVER!"** alert, and trigger `location.reload()` to restart.
- **Robust Class Handling**: Replaced a loose string comparison of classList with the modern, standard `!dino.classList.contains("jump")` check.
