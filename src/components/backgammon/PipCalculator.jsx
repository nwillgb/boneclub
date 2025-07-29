
import React from "react";

export default function PipCalculator() {
  const calculatePipCount = (position, color) => {
    let pipCount = 0;
    
    // Count checkers on points
    for (let point = 1; point <= 24; point++) {
      if (position[point] && position[point].color === color) {
        const distance = color === 'white' ? point : (25 - point);
        pipCount += position[point].count * distance;
      }
    }
    
    // Count checkers on the bar
    const barKey = color === 'white' ? 'bar_white' : 'bar_black';
    if (position[barKey] && position[barKey].count > 0) {
      const barDistance = color === 'white' ? 25 : 25; // Bar distance is always 25 for both colors (to move off the bar to point 1 or 24, which are 24 points away from bar, + 1 for initial movement)
      pipCount += position[barKey].count * barDistance;
    }
    
    return pipCount;
  };

  const generateRandomPosition = (difficulty = 'intermediate') => {
    const position = {};
    
    // Generate different complexity based on difficulty
    const complexityMap = {
      beginner: { minPoints: 3, maxPoints: 6, maxCheckersPerPoint: 3 },
      intermediate: { minPoints: 4, maxPoints: 8, maxCheckersPerPoint: 4 },
      advanced: { minPoints: 6, maxPoints: 12, maxCheckersPerPoint: 5 }
    };
    
    const config = complexityMap[difficulty];
    const numPoints = Math.floor(Math.random() * (config.maxPoints - config.minPoints + 1)) + config.minPoints;
    const usedPoints = new Set();
    
    // Randomly place checkers for white
    let whiteCheckersRemaining = 15;
    for (let i = 0; i < numPoints && whiteCheckersRemaining > 0; i++) {
      let point;
      do {
        point = Math.floor(Math.random() * 24) + 1;
      } while (usedPoints.has(point));
      
      usedPoints.add(point);
      const checkersOnPoint = Math.min(
        Math.floor(Math.random() * config.maxCheckersPerPoint) + 1,
        whiteCheckersRemaining
      );
      
      position[point] = {
        color: 'white',
        count: checkersOnPoint
      };
      
      whiteCheckersRemaining -= checkersOnPoint;
    }
    
    // Place remaining checkers randomly, but limit to max per point
    while (whiteCheckersRemaining > 0) {
      const point = Math.floor(Math.random() * 24) + 1;
      if (!position[point]) {
        const checkersToPlace = Math.min(
          whiteCheckersRemaining, 
          Math.floor(Math.random() * config.maxCheckersPerPoint) + 1
        );
        position[point] = {
          color: 'white',
          count: checkersToPlace
        };
        whiteCheckersRemaining -= checkersToPlace;
      } else if (position[point].count < config.maxCheckersPerPoint) {
        const additionalCheckers = Math.min(
          whiteCheckersRemaining,
          config.maxCheckersPerPoint - position[point].count
        );
        position[point].count += additionalCheckers;
        whiteCheckersRemaining -= additionalCheckers;
      }
      // If the point is already at maxCheckersPerPoint, this iteration doesn't place checkers
      // and the loop will continue to try other random points until all checkers are placed.
    }
    
    return position;
  };

  return {
    calculatePipCount,
    generateRandomPosition
  };
}
