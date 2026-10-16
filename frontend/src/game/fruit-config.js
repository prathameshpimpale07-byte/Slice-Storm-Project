export const FRUIT_TYPES = {
  apple: {
    emoji: "🍎",
    points: 10,
    radius: 28,
    spawnWeight: 24,
    launchSpeed: { min: 650, max: 800 },
    horizontalSpeed: { min: -180, max: 180 },
    gravity: 980,
    color: "#ef4444",
  },
  orange: {
    emoji: "🍊",
    points: 12,
    radius: 27,
    spawnWeight: 20,
    launchSpeed: { min: 680, max: 830 },
    horizontalSpeed: { min: -210, max: 210 },
    gravity: 980,
    color: "#fb923c",
  },
  banana: {
    emoji: "🍌",
    points: 15,
    radius: 30,
    spawnWeight: 15,
    launchSpeed: { min: 720, max: 880 },
    horizontalSpeed: { min: -240, max: 240 },
    gravity: 950,
    color: "#facc15",
  },
  watermelon: {
    emoji: "🍉",
    points: 20,
    radius: 34,
    spawnWeight: 10,
    launchSpeed: { min: 700, max: 850 },
    horizontalSpeed: { min: -160, max: 160 },
    gravity: 1000,
    color: "#22c55e",
  },
  strawberry: {
    emoji: "🍓",
    points: 18,
    radius: 25,
    spawnWeight: 14,
    launchSpeed: { min: 760, max: 900 },
    horizontalSpeed: { min: -260, max: 260 },
    gravity: 980,
    color: "#f43f5e",
  },
  kiwi: {
    emoji: "🥝",
    points: 14,
    radius: 26,
    spawnWeight: 10,
    launchSpeed: { min: 670, max: 820 },
    horizontalSpeed: { min: -220, max: 220 },
    gravity: 990,
    color: "#84cc16",
  },
  pineapple: {
    emoji: "🍍",
    points: 25,
    radius: 32,
    spawnWeight: 7,
    launchSpeed: { min: 740, max: 890 },
    horizontalSpeed: { min: -190, max: 190 },
    gravity: 1020,
    color: "#eab308",
  },
};

const fruitEntries = Object.entries(FRUIT_TYPES);
const totalSpawnWeight = fruitEntries.reduce(
  (total, [, fruit]) => total + fruit.spawnWeight,
  0
);

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function chooseFruitType() {
  let threshold = Math.random() * totalSpawnWeight;

  for (const [type, config] of fruitEntries) {
    threshold -= config.spawnWeight;
    if (threshold <= 0) return type;
  }

  return fruitEntries[fruitEntries.length - 1][0];
}

export function createFruit(canvasWidth, canvasHeight) {
  const type = chooseFruitType();
  const config = FRUIT_TYPES[type];

  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    x: randomBetween(config.radius, Math.max(config.radius, canvasWidth - config.radius)),
    y: canvasHeight + config.radius,
    vx: randomBetween(config.horizontalSpeed.min, config.horizontalSpeed.max),
    vy: -randomBetween(config.launchSpeed.min, config.launchSpeed.max),
    radius: config.radius,
    rotation: randomBetween(-Math.PI, Math.PI),
    rotationSpeed: randomBetween(-3.5, 3.5),
    gravity: config.gravity,
    points: config.points,
    emoji: config.emoji,
    color: config.color,
    sliced: false,
  };
}
