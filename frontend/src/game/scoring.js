const COMBO_MILESTONES = [3, 5, 10];
const MULTI_SLICE_BONUS = 5;

export function calculateSliceScore(slicedFruits, currentCombo) {
  const basePoints = slicedFruits.reduce((total, fruit) => total + fruit.points, 0);
  const multiSliceBonus = slicedFruits.length > 1
    ? (slicedFruits.length - 1) * MULTI_SLICE_BONUS
    : 0;
  const nextCombo = currentCombo + slicedFruits.length;
  const milestone = COMBO_MILESTONES.find(
    (value) => currentCombo < value && nextCombo >= value
  );

  return {
    basePoints,
    multiSliceBonus,
    totalPoints: basePoints + multiSliceBonus,
    nextCombo,
    milestoneMessage: milestone ? `×${milestone} COMBO!` : null,
  };
}

export function createScoreLabels(slicedFruits, scoreResult, timestamp) {
  const labels = slicedFruits.map((fruit) => ({
    id: `${fruit.id}-score`,
    text: `+${fruit.points}`,
    x: fruit.x,
    y: fruit.y,
    color: fruit.color,
    createdAt: timestamp,
  }));

  if (scoreResult.multiSliceBonus > 0 && slicedFruits.length > 1) {
    const center = slicedFruits.reduce(
      (result, fruit) => ({
        x: result.x + fruit.x / slicedFruits.length,
        y: result.y + fruit.y / slicedFruits.length,
      }),
      { x: 0, y: 0 }
    );
    labels.push({
      id: `multi-${timestamp}`,
      text: `+${scoreResult.multiSliceBonus} MULTI`,
      x: center.x,
      y: center.y - 28,
      color: "#39ff14",
      createdAt: timestamp,
    });
  }

  return labels;
}
