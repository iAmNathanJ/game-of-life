'use strict';

module.exports = function Surveyor(options) {

  let limitX = options.limitX;
  let limitY = options.limitY;

  const exists = (target, world) => {
    for(let i = 0; i < world.length; i++) {
      if(target.x === world[i].x && target.y === world[i].y) {
        return true;
      }
    }
    return false;
  };

  const survey = (proximity, cb) => {
    var x, y;
    proximity = Math.abs(proximity) || 1;
    for(x = -proximity; x <= proximity; x++) {
      for(y = -proximity; y <= proximity; y++) {
        if(x === 0 && y === 0) continue;
        cb(x, y);
      }
    }
  };

  const offset = (target, offsetX, offsetY) => {
    return {
      x: target.x + offsetX,
      y: target.y + offsetY
    };
  };

  const countNeighbors = (target, world) => {
    var total = 0
      , neighbor;
    survey(1, (x, y) => {
      neighbor = offset(target, x, y);
      // console.log(`limits: ${limitX}:${limitY}`);
      console.log(target, neighbor, Math.abs(neighbor.x) > (limitX/2));
      if(limitX && Math.abs(neighbor.x) > (limitX/2)) return;
      if(limitY && Math.abs(neighbor.y) > (limitY/2)) return;
      if(exists(neighbor, world)) total += 1;
    });
    return total;
  };

  const potentialInfluence = (target, world, tracked) => {
    var possibleLocations = []
      , neighbor, untracked, comeToLife;

    survey(1, (x, y) => {
      neighbor = offset(target, x, y);
      if(limitX && Math.abs(neighbor.x) > (limitX/2)) return;
      if(limitY && Math.abs(neighbor.y) > (limitY/2)) return;
      untracked = !exists(neighbor, world) && !exists(neighbor, tracked);
      comeToLife = countNeighbors(neighbor, world) === 3;
      if(untracked && comeToLife) possibleLocations.push(neighbor);
    });
    return possibleLocations;
  };

  return {
    countNeighbors: countNeighbors,
    potentialInfluence: potentialInfluence
  };

};
