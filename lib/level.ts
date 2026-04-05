export function getLevelFromXp(xp: number) {
  let level = 1;
  let xpNeeded = 100;
  let totalXp = 0;

  while (xp >= totalXp + xpNeeded) {
    totalXp += xpNeeded;
    level++;
    xpNeeded = Math.floor(xpNeeded * 1.5);
  }

  return {
    level,
    currentLevelXp: xp - totalXp,
    xpToNextLevel: xpNeeded,
    totalXp,
  };
}
