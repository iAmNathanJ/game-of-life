'use strict';

let surveyor = require('./surveyor.js')
  , countNeighbors = surveyor.countNeighbors
  , potentialInfluence = surveyor.potentialInfluence;

let rules = {
  survivors(neighbors) {
    return neighbors > 1 && neighbors < 4;
  },
  newLife(neighbors) {
    return neighbors === 3;
  }
};
