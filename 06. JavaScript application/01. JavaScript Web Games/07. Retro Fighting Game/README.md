# 🥊 Retro Fighting Game (Retro Kombat)

A 2D arcade-style fighting game built from scratch using HTML5 Canvas, Vanilla JavaScript classes, and retro cyber-themed CSS styling. Features a playable character fighting against an automated computer AI.

## 🎮 How to Play

1. Open `index.html` in your web browser.
2. Press any key on the start screen to begin the fight.
3. Control your character (PLAYER 1 - Pink) to move and attack the computer (CPU - Cyan).
4. Deplete the computer's health bar to win.
5. If the computer depletes your health bar first, you lose.
6. Press **"P"** to pause/resume the game at any time.
7. Press **"R"** to restart a match.

## ⌨️ Controls

- **A**: Move Left
- **D**: Move Right
- **J**: Punch (Quick Attack - deals 10 damage)
- **K**: Kick (Strong Attack - deals 15 damage)
- **L** (Hold): Block (Reduces incoming damage by 75%)
- **P**: Pause / Resume Game
- **R**: Restart Match

## 🛠️ Technical Details & Refactoring

- **Sprite Classes**: Utilizes OOP JavaScript classes (`Fighter`) to control physics properties (velocity, gravity acceleration `0.7`), collision boxes, and attack timers.
- **Computer AI Logic (`manageEnemyAI`)**: The computer automatically tracks the player's position, approaches when out of range, and dynamically rolls decisions to punch, kick, or block based on proximity timers.
- **Hit Detection and Flash Feedback**: Performs axis-aligned bounding box (AABB) checks to detect attack collisions. Incorporates a white flashing animation on hit frames for arcade visual feedback.
- **Robust Health Calculation**: Refactored the health bar CSS width formatting. Previously, when a fighter's health dropped to `0`, the width was calculated as `calc(0% - 6px)`, resulting in a negative width value (`-6px`). The calculation was updated to:
  ```javascript
  const healthPercentage = this.health > 0 ? `calc(${this.health}% - 6px)` : '0%';
  ```
  This cleanly sets the progress bar width to `0%` on defeat.
