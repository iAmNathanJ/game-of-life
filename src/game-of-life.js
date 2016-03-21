'use strict';

const seed = require('./seed.js');
const surveyor = require('./surveyor.js');

const rules = {
  survivors(neighbors) {
    return neighbors > 1 && neighbors < 4;
  },
  newLife(neighbors) {
    return neighbors === 3;
  }
};

module.exports = (function Life() {

  let state = [];

  let api = {

    generate() {
      let neighbors;
      let potentialLife = [];

      let survivors = state.filter(location => {
        neighbors = surveyor.countNeighbors(location, state);
        potentialLife.concat(surveyor.potentialInfluence(location, state, potentialLife));
        return rules.survivors(neighbors);
      });

      // let potentialLife = state.reduce((candidates, location) => {
      //   return candidates.concat(neighbors);
      // }, []);

      // let newLife = potentialLife.filter(location => {
      //   neighbors = surveyor.countNeighbors(location, state);
      //   return rules.newLife(neighbors);
      // });

      return state = survivors.concat(potentialLife);
    }
  };

  Object.defineProperty(api, 'seed', {
    value: function(width, height) {
      state = seed(width, height);
    },
    writable: false,
    configurable: false
  });

  Object.defineProperty(api, 'state', {
    get: function() {
      return state;
    }
  });

  return api;

})();