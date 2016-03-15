'use strict';

const findIndex = require('lodash/findIndex');

module.exports = (function Surveyor(_3D) {

  const exists = (target, world) => {
    return findIndex(world, target) >= 0;
  };

  // ================
  // 2D
  // ================
  const survey = (proximity, cb) => {
    proximity = Math.abs(proximity) || 1;
    for(let x = -proximity; x <= proximity; x++) {
      for(let y = -proximity; y <= proximity; y++) {
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
    let total = 0;
    survey(1, (x, y) => {
      if(x === 0 && y === 0) {
        return;
      } else {
        let neighbor = offset(target, x, y);
        if(exists(neighbor, world)) {
          console.log(neighbor);
          total += 1;
        }
      }
    });
    return total;
  };

  const potentialInfluence = (target, world) => {
    possibleLocations = [];
    survey(1, (x, y) => {
      let neighbor      = offset(target, x, y)
        , alreadyLiving = exists(neighbor, world)
        , alreadyListed = exists(neighbor, possibleLocations);
      if(!alreadyLiving && !alreadyListed) {
        possibleLocations.push(neighbor);
      }
    });
    return possibleLocations;
  };

  // ================
  // 3D
  // ================
  const survey3D = (proximity, cb) => {
    proximity = Math.abs(proximity) || 1;
    for(let x = -proximity; x <= proximity; x++) {
      for(let y = -proximity; y <= proximity; y++) {
        for(let z = -proximity; z <= proximity; z++) {
          cb(x, y, z);
        }
      }
    }
  };

  const offset3D = (target, offsetX, offsetY, offsetZ) => {
    return {
      x: target.x + offsetX,
      y: target.y + offsetY,
      z: target.z + offsetZ
    };
  };

  const countNeighbors3D = (target, world) => {
    let total = 0;
    survey3D(1, (x, y, z) => {
      if(x !== 0 && y !== 0 && z !== 0) {
        let neighbor = offset3D(target, x, y, z);
        if(!exists(neighbor, world)) {
          total += 1;
        }
      }
    });
    return total;
  };

  const potentialInfluence3D = (target, world) => {
    possibleLocations = [];
    survey3D(1, (x, y, z) => {
      let neighbor      = offset3D(target, x, y, z)
        , alreadyLiving = exists(neighbor, world)
        , alreadyListed = exists(neighbor, possibleLocations);
      if(!alreadyLiving && !alreadyListed) {
        possibleLocations.push(neighbor);
      }
    });
    return possibleLocations;
  };

  if(_3D) {
    return {
      countNeighbors: countNeighbors3D,
      potentialInfluence: potentialInfluence3D
    };
  } else {
    return {
      countNeighbors: countNeighbors,
      potentialInfluence: potentialInfluence
    };
  }

})();
