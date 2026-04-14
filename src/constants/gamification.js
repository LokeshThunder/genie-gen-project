export const XP_LEVELS = [
  { level: 1, minXp: 0, label: "Beginner", bonus: 0 },
  { level: 2, minXp: 500, label: "Pro", bonus: 1.05 },
  { level: 3, minXp: 1500, label: "Expert", bonus: 1.10 },
  { level: 4, minXp: 4000, label: "Elite", bonus: 1.25 },
  { level: 5, minXp: 10000, label: "Master", bonus: 1.50 }
];

export const BADGES = [
  { id: 'early_bird', label: 'Early Bird', icon: '🌅', description: 'Complete 5 shifts before 8:00 AM' },
  { id: 'reliability_pro', label: 'Reliability Pro', icon: '💎', description: 'Maintain 100% attendance for a month' },
  { id: 'fast_learner', label: 'Fast Learner', icon: '📚', description: 'Complete onboarding in under 24 hours' },
  { id: 'team_player', label: 'Team Player', icon: '🤝', description: 'Work 10 shifts at the same site' },
  { id: 'night_owl', label: 'Night Owl', icon: '🦉', description: 'Complete 5 night shifts' }
];

export const calculateLevel = (xp) => {
  const levelObj = [...XP_LEVELS].reverse().find(l => xp >= l.minXp);
  return levelObj || XP_LEVELS[0];
};

export const getProgressToNextLevel = (xp) => {
  const currentLevel = calculateLevel(xp);
  const nextLevel = XP_LEVELS.find(l => l.level === currentLevel.level + 1);
  
  if (!nextLevel) return 100;
  
  const range = nextLevel.minXp - currentLevel.minXp;
  const progress = xp - currentLevel.minXp;
  return Math.min(100, Math.max(0, (progress / range) * 100));
};
