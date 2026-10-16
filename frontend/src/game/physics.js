const MAX_DELTA_SECONDS = 0.05;

export function getDeltaSeconds(timestamp, previousTimestamp) {
  if (previousTimestamp === null) return 0;

  return Math.min(
    Math.max((timestamp - previousTimestamp) / 1000, 0),
    MAX_DELTA_SECONDS
  );
}

export function updateFruit(fruit, deltaSeconds) {
  return {
    ...fruit,
    x: fruit.x + fruit.vx * deltaSeconds,
    y: fruit.y + fruit.vy * deltaSeconds,
    vy: fruit.vy + fruit.gravity * deltaSeconds,
    rotation: fruit.rotation + fruit.rotationSpeed * deltaSeconds,
  };
}

export function updateFruits(fruits, deltaSeconds, canvasHeight) {
  return fruits
    .map((fruit) => updateFruit(fruit, deltaSeconds))
    .filter((fruit) => !isFruitOffscreen(fruit, canvasHeight));
}

export function isFruitOffscreen(fruit, canvasHeight) {
  return fruit.y - fruit.radius > canvasHeight + fruit.radius;
}
