// utils/level.ts

type LevelInfo = {
  level: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  totalXp: number;
  progress: number; // 0 → 1
};

// 🎯 CONFIGURE SEUS NÍVEIS AQUI
// cada valor = XP total necessário para chegar no nível
const LEVELS = [
  0, // Level 1
  100, // Level 2
  250, // Level 3
  500, // Level 4
  900, // Level 5
  1400, // Level 6
  2000, // Level 7
  3000, // Level 8
  4500, // Level 9
  6500, // Level 10
];

export function getLevelFromXp(xp: number): LevelInfo {
  let level = 1;

  // 🔍 Descobre o nível atual
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  const currentLevelStartXp = LEVELS[level - 1] ?? 0;

  // se estiver no último nível, trava no máximo
  const nextLevelXp = LEVELS[level] ?? LEVELS[LEVELS.length - 1];

  const xpToNextLevel = nextLevelXp - currentLevelStartXp;
  const currentLevelXp = xp - currentLevelStartXp;

  return {
    level,
    currentLevelXp,
    xpToNextLevel,
    totalXp: currentLevelStartXp,
    progress: xpToNextLevel > 0 ? currentLevelXp / xpToNextLevel : 1,
  };
}
