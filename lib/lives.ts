export function calculateLives(
  currentLives: number,
  maxLives: number,
  updatedAt: Date,
) {
  const now = new Date();

  const diffInHours =
    (now.getTime() - new Date(updatedAt).getTime()) / (1000 * 60 * 60);

  const livesRecovered = Math.floor(diffInHours / 24);

  const newLives = Math.min(currentLives + livesRecovered, maxLives);

  return newLives;
}
