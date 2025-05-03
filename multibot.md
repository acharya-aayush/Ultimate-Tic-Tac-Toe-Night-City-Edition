AI Framework: Multi-Bot Implementation

Overview

This document specifies the technical blueprint for implementing four distinct AI opponents in our Ultimate Tic Tac Toe game. Each bot embodies unique strategies, personality, and difficulty. We’ll replace the default hard-only AI with a fully modular, switchable system.

AI Bot Profiles

Difficulty

Bot Identifier

Personality & Lore

Easy

royce

Chaotic Maelstrom gang leader—unpredictable rule-based logic

Medium

goro

Ex-Arasaka bodyguard—probabilistic minimax hybrid

Hard

adamSmasher

Full-borg mercenary—deep minimax with alpha‑beta pruning

Extreme

aayushAcharya

Custom mythic AI—extended-depth minimax stub for future MCTS/NN

Note for Cursor integration: Use the Cursor tool to analyze and integrate image assets located in /assets/images/royce.png, /assets/images/goro.png, /assets/images/adamSmasher.png, and /assets/images/aayush.png. Assign each to its respective bot profile in the UI.

Difficulty Selector Refactor

export function selectAIDifficulty(level) {
  const mapping = {
    easy:    'royce',
    medium:  'goro',
    hard:    'adamSmasher',
    extreme: 'aayushAcharya'
  };
  window.selectedAIBot = mapping[level.toLowerCase()] || 'adamSmasher';
}

Directory & Module Structure

/ai
  │
  ├─ engine.js          # Core turn manager and dispatcher
  ├─ evaluation.js      # Shared evaluation heuristics and mode-specific weights
  ├─ moveSelector.js    # Exposes makeAIMove() based on selectedAIBot
  └─ bots
       ├─ royce.js           # easy rule-based AI logic
       ├─ goro.js            # medium minimax hybrid logic
       ├─ adamSmasher.js     # hard minimax w/ alpha-beta pruning
       └─ aayushAcharya.js   # extreme stub (depth=6, future MCTS/NN)

AI Implementations

royce.js (Easy)

Sequential checks: winning move, blocking move, preferred random

No search depth, purely rule-based

goro.js (Medium)

50% chance rule-based (royce) vs. 50% shallow minimax (adamSmasher at depth=2)

adamSmasher.js (Hard)

Full minimax with alpha‑beta pruning

Default depth: 3–4 plies depending on board state

aayushAcharya.js (Extreme)

Stub: calls minimax at depth=6

Placeholder for future MCTS or neural network evaluation

Implementation Roadmap (One Day Sprint)



Refactor selectAIDifficulty and UI hooks

Scaffold /ai/bots modules and import structure



Implement royce.js logic and test rule-based moves

Hook asset images for Royce (Cursor: assign royce.png)


Implement goro.js with hybrid approach; benchmark move times

Hook asset images for Goro (Cursor: assign goro.png)



Refactor and parameterize adamSmasher.js to accept dynamic depth

Hook asset images for Adam Smasher (Cursor: assign adamSmasher.png)



Create aayushAcharya.js stub with depth=6

Hook asset images for Aayush (Cursor: assign aayush.png)

Final integration, quick smoke tests, and commit

Conclusion

By the end of today’s session, you will have four fully functional AI bots—Royce, Goro, Adam Smasher, and Aayush Acharya—each with its own module, image asset, and difficulty wiring. Future expansions (MCTS, neural nets, dynamic difficulty) can now plug into the aayushAcharya.js stub.