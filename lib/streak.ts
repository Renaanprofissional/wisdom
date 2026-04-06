export function calculateStreak(lastStudyAt: Date | null) {
  const now = new Date();

  if (!lastStudyAt) {
    return { increment: true, reset: false };
  }

  const last = new Date(lastStudyAt);

  // zera horas
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());

  const diffDays = Math.floor(
    (today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) {
    return { increment: false, reset: false }; // já estudou hoje
  }

  if (diffDays === 1) {
    return { increment: true, reset: false }; // sequência continua
  }

  return { increment: true, reset: true }; // perdeu streak
}
