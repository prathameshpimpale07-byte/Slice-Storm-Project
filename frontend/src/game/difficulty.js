const MAX_DIFFICULTY = 1;

export function getDifficulty(elapsedSeconds) {
  const progress = Math.min(elapsedSeconds / 180, MAX_DIFFICULTY);

  return {
    level: 1 + Math.floor(progress * 4),
    spawnInterval: 0.95 - progress * 0.45,
    maxFruits: 3 + Math.floor(progress * 4),
    speedMultiplier: 1 + progress * 0.3,
    bombChance: 0.12 + progress * 0.14,
  };
}
