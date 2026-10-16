function distanceSquared(pointA, pointB) {
  const dx = pointA.x - pointB.x;
  const dy = pointA.y - pointB.y;
  return dx * dx + dy * dy;
}

export function distanceToSegmentSquared(point, start, end) {
  const segmentLengthSquared = distanceSquared(start, end);
  if (segmentLengthSquared === 0) return distanceSquared(point, start);

  const projection = (
    (point.x - start.x) * (end.x - start.x)
    + (point.y - start.y) * (end.y - start.y)
  ) / segmentLengthSquared;
  const clampedProjection = Math.max(0, Math.min(1, projection));
  const closestPoint = {
    x: start.x + clampedProjection * (end.x - start.x),
    y: start.y + clampedProjection * (end.y - start.y),
  };

  return distanceSquared(point, closestPoint);
}

export function segmentIntersectsCircle(start, end, circle) {
  const hitRadius = circle.radius + 8;
  return distanceToSegmentSquared(circle, start, end) <= hitRadius * hitRadius;
}

export function sliceFruitsBySegment(fruits, start, end, slicedAt) {
  const slicedFruits = [];

  fruits.forEach((fruit) => {
    if (fruit.sliced || !segmentIntersectsCircle(start, end, fruit)) return;

    fruit.sliced = true;
    fruit.slicedAt = slicedAt;
    slicedFruits.push(fruit);
  });

  return slicedFruits;
}

export function hitBombsBySegment(bombs, start, end, hitAt) {
  const hitBombs = [];

  bombs.forEach((bomb) => {
    if (bomb.hit || !segmentIntersectsCircle(start, end, bomb)) return;

    bomb.hit = true;
    bomb.hitAt = hitAt;
    hitBombs.push(bomb);
  });

  return hitBombs;
}
