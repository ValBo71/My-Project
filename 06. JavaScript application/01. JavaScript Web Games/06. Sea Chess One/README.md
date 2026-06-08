# ❌ Sea Chess (Морски шах)

An elegant web-based Tic-Tac-Toe (Морски шах) game built using HTML5, CSS (with premium dark gradients and glassmorphic designs), and Vanilla JavaScript. Features a smart computer AI opponent and score persistence across page reloads.

## 🎮 How to Play

1. Open `index.html` in your web browser.
2. The game displays the player's score (**"Човек"**) and the computer's score (**"Компютър"**).
3. Click on any empty cell in the 3x3 grid to place your **"X"** (Cyan).
4. The computer will immediately respond by placing an **"O"** (Orange).
5. Align three marks horizontally, vertically, or diagonally to win.
6. Winning marks will turn red and glow.
7. Click the **"Нова игра"** (New Game) button to clear the board and start a new round while keeping your scores.

## 🛠️ Technical Details & Refactoring

- **Glassmorphic UI**: Uses standard CSS gradients, `backdrop-filter: blur(10px)`, and subtle shadow glow animations to create a high-quality modern design.
- **Smart AI Opponent (`botZero`)**: The computer plays defensively and offensively. It checks combinations to see if it can win in the next move, then checks if it needs to block a player's winning move, and defaults to a random cell if no immediate threats or opportunities exist.
- **Score Persistence**: Uses `sessionStorage` to store and recover scores, preventing reset on page reload.
- **Clean Event Delegation**: Refactored the game's event listener. Previously, click inputs were bound globally to the `window` object. This was replaced with event delegation targeting `.board` directly:
  ```javascript
  document.querySelector(".board").addEventListener("click", function(event) { ... })
  ```
  This eliminates global event pollution and improves security.
