import { PRIORITY_LEVELS } from '../constants/statuses';

const SCORING_WEIGHTS = {
  BASE: {
    [PRIORITY_LEVELS.CRITICAL]: 100,
    [PRIORITY_LEVELS.HIGH]: 50,
    [PRIORITY_LEVELS.NORMAL]: 10,
  },
  WAIT_TIME_MULTIPLIER: 2,
  MAX_WAIT_BONUS: 60, 
  
  BURN_RATE_CRITICAL: { HOURS: 2, BONUS: 200 },
  BURN_RATE_WARNING: { HOURS: 6, BONUS: 80 }, 
  
  ABSOLUTE_LOW_STOCK: { THRESHOLD: 20, BONUS: 80 },
  
  DEFERRAL_BONUS: 30,
  SPATIAL_BONUS: 80,
};

export const calculatePriorityScore = (request, routeMatch = false) => {
  let score = 0;

  if (request.priority === PRIORITY_LEVELS.CRITICAL && request.quotaExceeded) {
    score += SCORING_WEIGHTS.BASE[PRIORITY_LEVELS.NORMAL];
  } else {
    score += SCORING_WEIGHTS.BASE[request.priority] || 0;
  }

  if (request.timestamp) {
    const createdDate = new Date(request.timestamp);
    const hoursWaiting = Math.max(0, Math.floor((Date.now() - createdDate) / (1000 * 60 * 60)));
    const waitBonus = hoursWaiting * SCORING_WEIGHTS.WAIT_TIME_MULTIPLIER;
    score += Math.min(waitBonus, SCORING_WEIGHTS.MAX_WAIT_BONUS);
  }

  if (request.burnRate > 0 && request.currentStock !== undefined) {
    const hoursToEmpty = request.currentStock / request.burnRate;
    
    if (hoursToEmpty <= SCORING_WEIGHTS.BURN_RATE_CRITICAL.HOURS) {
      score += SCORING_WEIGHTS.BURN_RATE_CRITICAL.BONUS;
    } else if (hoursToEmpty <= SCORING_WEIGHTS.BURN_RATE_WARNING.HOURS) {
      score += SCORING_WEIGHTS.BURN_RATE_WARNING.BONUS;
    }
  } else if (request.currentStock < SCORING_WEIGHTS.ABSOLUTE_LOW_STOCK.THRESHOLD) {
    score += SCORING_WEIGHTS.ABSOLUTE_LOW_STOCK.BONUS;
  }

  if (request.hasDeferred) {
    score += SCORING_WEIGHTS.DEFERRAL_BONUS;
  }

  if (routeMatch) {
    score += SCORING_WEIGHTS.SPATIAL_BONUS;
  }

  return score;
};