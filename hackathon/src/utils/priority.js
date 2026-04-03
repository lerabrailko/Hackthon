
import { PRIORITY_LEVELS } from '../constants/statuses';

export const calculatePriorityScore = (request) => {
  let score = 0;
  const basePoints = {
    [PRIORITY_LEVELS.CRITICAL]: 100,
    [PRIORITY_LEVELS.HIGH]: 50,
    [PRIORITY_LEVELS.NORMAL]: 10,
  };
  score += basePoints[request.priority] || 0;
  const createdDate = new Date(request.timestamp);
  const now = new Date();
  const hoursWaiting = Math.floor((now - createdDate) / (1000 * 60 * 60));
  
  score += hoursWaiting * 2;
  if (request.currentStock < 20) {
    score += 80;
  }

  return score;
};