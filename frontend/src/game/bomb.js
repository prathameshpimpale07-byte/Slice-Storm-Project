const BOMB_CONFIG = {
  radius: 30,
  spawnWeight: 18,
  launchSpeed: { min: 680, max: 840 },
  horizontalSpeed: { min: -220, max: 220 },
  gravity: 1000,
  color: "#ff006e",
};

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function createBomb(canvasWidth, canvasHeight) {
  return {
    id: `bomb-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: "bomb",
    x: randomBetween(BOMB_CONFIG.radius, Math.max(BOMB_CONFIG.radius, canvasWidth - BOMB_CONFIG.radius)),
    y: canvasHeight + BOMB_CONFIG.radius,
    vx: randomBetween(BOMB_CONFIG.horizontalSpeed.min, BOMB_CONFIG.horizontalSpeed.max),
    vy: -randomBetween(BOMB_CONFIG.launchSpeed.min, BOMB_CONFIG.launchSpeed.max),
    radius: BOMB_CONFIG.radius,
    rotation: randomBetween(-Math.PI, Math.PI),
    rotationSpeed: randomBetween(-2.5, 2.5),
    gravity: BOMB_CONFIG.gravity,
    color: BOMB_CONFIG.color,
    hit: false,
  };
}
