# 🖱️ Clickr Game

A fast-paced reflex web game where the objective is to click a button as many times as possible within a 5-second window. Developed using Vanilla HTML, CSS, and JavaScript.

## 🎮 How to Play

1. Open `index.html` in your web browser.
2. Click the **"Clickr"** button to start the game.
3. Once the timer begins, click the button as fast as you can.
4. The remaining time and your click count will update in real-time.
5. When the timer hits `0.00`, the game is over. Click the button again to restart.

## 🛠️ Technical Details & Refactoring

- **Google Fonts & Styling**: Features a retro arcade pixel font (`'Press Start 2P'`) and a tactile 3D retro button effect with CSS `box-shadow` changes on `:active` clicks.
- **Accurate Millisecond Timer**: Uses `Date.now()` differences to keep a high-precision decimal timer.
- **Critical Code Refactoring**:
  - **Duplicate Function Cleanup**: Removed a duplicate declaration of the `start()` function in `index.js` which caused code bloat and scope confusion.
  - **Click Score Lag Fix**: Changed the button event from a post-increment `clicks++` output (which displayed `0` on the first click and lagged behind by 1) to a block increment that correctly renders `1` on the first score click.
  - **Score Reset Fix**: Reset `clicks = 0` on initialization so restarts clean up the previous score.
  - **Replayability Enhancement**: Restored the button's event listener to `start` when the game ends, allowing users to replay without reloading the page.
