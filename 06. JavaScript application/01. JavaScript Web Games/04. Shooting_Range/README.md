# 🎯 Shooting Range Game

An interactive, canvas-free clicker shooting game built with Vanilla HTML, CSS (flexbox and 3D transforms), and JavaScript. 

## 🎮 How to Play

1. Open `index.html` in your web browser.
2. Aim at the five beer cans standing on the shelf using your crosshair cursor.
3. Click a can to shoot it. A "hit" sound plays and the target falls backward.
4. Clicking outside the cans fires a generic gunshot sound.
5. Hit all five cans to knock them down, resetting the board automatically.

## ⌨️ Controls

- **Mouse Move**: Position Crosshair
- **Left Click**: Shoot / Select Target

## 🛠️ Technical Details & Refactoring

- **CSS Crosshair**: Uses a custom cursor asset (`5a3755ce..._jvy9hf.png`) to render a target crosshair over the play space.
- **3D CSS Transforms**: Dead cans are knocked down by applying the `.die` class, which triggers a `transform: rotateX(80deg)` translation from the bottom anchor point.
- **Dynamic Audio Interruption**: Custom prototype method `HTMLAudioElement.prototype.stop()` clears playing audio so rapid shots interrupt sound clips cleanly without latency.
- **Score Duplication Fix**: Previously, clicking an already-hit can (which already had the `.die` class) still incremented the counter and triggered early board resets. The target detection logic in `game.js` has been updated to:
  ```javascript
  if(el.classList.contains('beer') && !el.classList.contains('die'))
  ```
  This guarantees only upright cans register hits.
