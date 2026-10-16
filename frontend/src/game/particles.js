const MAX_PARTICLES = 240;
const PARTICLE_LIFETIME_MS = 520;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function createBurst(x, y, color, createdAt, count = 12) {
  const particles = [];
  const burstCount = Math.min(count, MAX_PARTICLES);

  for (let index = 0; index < burstCount; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomBetween(90, 260);
    particles.push({
      id: `${createdAt}-${index}-${Math.random().toString(36).slice(2)}`,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 50,
      size: randomBetween(2, 5),
      gravity: 420,
      color,
      createdAt,
      lifetime: PARTICLE_LIFETIME_MS + randomBetween(-80, 80),
    });
  }

  return particles;
}

export function updateParticles(particles, deltaSeconds, timestamp) {
  return particles
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx * deltaSeconds,
      y: particle.y + particle.vy * deltaSeconds,
      vy: particle.vy + particle.gravity * deltaSeconds,
    }))
    .filter((particle) => timestamp - particle.createdAt < particle.lifetime)
    .slice(-MAX_PARTICLES);
}

export function drawParticles(ctx, particles, timestamp) {
  particles.forEach((particle) => {
    const progress = Math.min(
      1,
      (timestamp - particle.createdAt) / particle.lifetime
    );
    ctx.save();
    ctx.globalAlpha = 1 - progress;
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * (1 - progress * 0.35), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}
