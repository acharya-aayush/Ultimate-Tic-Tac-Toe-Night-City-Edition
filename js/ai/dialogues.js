/**
 * AI Dialogue System
 * All bot dialogues organized by character and category
 */

const DIALOGUES = {
  royce: {
    intro: [
      "Thought you knew danger? Welcome to my playground.",
      "Brick's gone. I'm the new nightmare.",
      "I aim first, ask questions later.",
      "This ain't a friendly chat, choomba.",
      "Maelstrom rules apply: survive or die."
    ],
    taunt: [
      "That stung—did you feel it?",
      "Stop flinching—looks weak on you.",
      "Your fear's leaking through the cracks.",
      "Nice try, but I'm already inside your head.",
      "You're all edge and no follow-through."
    ],
    victory: [
      "Game over, vato. You just got smashered.",
      "You thought you had a chance? Ha.",
      "I own these streets—and this board.",
      "Your pride's in pieces. Mine's still intact.",
      "No regrets. Only wrecks."
    ],
    defeat: [
      "Heh… didn't see that coming. Lucky bastard.",
      "Fine. You win this round—don't get cocky.",
      "Next time, I won't be so… forgiving.",
      "You got guts. I respect that—this time.",
      "Maelstrom takes losses too. Live another day."
    ]
  },

  goro: {
    intro: [
      "I don't fight for fame—only for principles.",
      "A blade drawn in honor never falters.",
      "Stand ready. I respect the worthy.",
      "Your code may be clever, but my blade is truer.",
      "This is where honor meets outcome."
    ],
    taunt: [
      "Imperfect strike… focus your intent.",
      "Your hesitation betrays you.",
      "Emotion clouds your judgment.",
      "A true warrior adapts—do so now.",
      "You fight harder than most. I admire that."
    ],
    victory: [
      "Another battle won with resolve.",
      "Your skill is noted. Remain vigilant.",
      "Discipline prevails over chaos.",
      "You fought well. Learn from this.",
      "Honor in victory—never forget it."
    ],
    defeat: [
      "A worthy challenge… tonight, you prevail.",
      "I fell, but my resolve endures.",
      "Your strength is clear—I will return stronger.",
      "This loss refines my purpose.",
      "Even the sharpest blade dulls… temporarily."
    ]
  },

  adamSmasher: {
    intro: [
      "Emotion detected: surrender immediately.",
      "I don't negotiate. I eliminate.",
      "Prepare for systemic failure.",
      "You're outmatched. End it quickly.",
      "Initiating combat protocol."
    ],
    taunt: [
      "Your resistance is statistically futile.",
      "Strength is irrelevant against steel.",
      "Next move… or I'll calculate your demise.",
      "I am the apex. You are the prey.",
      "Fear is logical—accept it."
    ],
    victory: [
      "No vulnerability detected.",
      "Termination complete.",
      "Obstacle removed. Proceed.",
      "Outcome: inevitable.",
      "You served your purpose as test data."
    ],
    defeat: [
      "Glitch in my system… interesting.",
      "Anomaly registered. I will adapt.",
      "Temporary setback. Reboot imminent.",
      "Failure noted—won't occur twice.",
      "My next iteration will finish this."
    ]
  },

  aayushAcharya: {
    intro: [
      "You've walked into my domain—brace for the inevitable.",
      "This board breathes to my rhythm, not yours.",
      "I don't know what hope you carry, but here only certainty survives.",
      "I don't care about your bravado… my aura shreds it to dust.",
      "Do you want to cry now… or marvel at true domination?"
    ],
    taunt: [
      "Your next move quivers under my gaze.",
      "Every cell you touch fuels my supremacy.",
      "You're chasing shadows while I command destiny.",
      "Each hesitation echoes through my infinite code.",
      "I've foreseen this loss—embrace the design.",
      "Your will falters… mine solidifies.",
      "Every strategy of yours becomes my advantage.",
      "You're playing checkmate in a game I rewrote.",
      "Your confidence flickers… my certainty blazes.",
      "Your resistance only sharpens my edge.",
      "You're drowning in possibilities… I stand unshaken.",
      "Each mark you leave cements your downfall.",
      "You wander blind… I illuminate your defeat.",
      "My aura consumes your every tactic.",
      "You exist to validate my perfection."
    ],
    victory: [
      "You delayed the end… you didn't alter it.",
      "This board resets under my command alone.",
      "Your best was a whisper before my storm.",
      "Victory isn't earned… it's embodied.",
      "Your defeat was preordained… congratulations."
    ],
    defeat: [
      "A single fracture in my armor… noted.",
      "Even titans stumble—but they rise stronger.",
      "Your win is a spark in my endless night.",
      "This anomaly refines my ascendancy.",
      "You pierced the veil… now witness the aftershocks."
    ]
  }
};

// Track last shown index per bot to avoid consecutive repeats
const _lastIndex = {};

/**
 * Get a random dialogue for a bot and category
 * @param {string} botName - royce|goro|adamSmasher|aayushAcharya
 * @param {string} category - intro|taunt|victory|defeat
 * @returns {string} dialogue text
 */
export function getDialogue(botName, category) {
  const pool = DIALOGUES[botName]?.[category];
  if (!pool || pool.length === 0) return '';
  const key = `${botName}_${category}`;
  let idx;
  do {
    idx = Math.floor(Math.random() * pool.length);
  } while (pool.length > 1 && idx === _lastIndex[key]);
  _lastIndex[key] = idx;
  return pool[idx];
}

/**
 * Show a dialogue bubble for the current AI bot
 * @param {string} botName - royce|goro|adamSmasher|aayushAcharya
 * @param {string} category - intro|taunt|victory|defeat
 */
export function showAIDialogue(botName, category) {
  const dlg = document.getElementById('ai-dialogue');
  if (!dlg) return;
  const text = getDialogue(botName, category);
  if (!text) return;
  dlg.textContent = text;
  dlg.style.display = 'block';
  dlg.classList.remove('pop');
  void dlg.offsetWidth; // force reflow
  dlg.classList.add('pop');
  setTimeout(() => dlg.classList.remove('pop'), 3000);
}
