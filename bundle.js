(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

let controlState = [
  { x: 0, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: 2 },

  { x: 10, y: 0 },
  { x: 10, y: 1 },
  { x: 10, y: 2 },

  { x: 20, y: 0 },
  { x: 20, y: 1 },
  { x: 20, y: 2 },

  { x: 30, y: 0 },
  { x: 30, y: 1 },
  { x: 30, y: 2 },

  { x: 40, y: 0 },
  { x: 40, y: 1 },
  { x: 40, y: 2 },

  { x: 50, y: 0 },
  { x: 50, y: 1 },
  { x: 50, y: 2 },

  { x: 60, y: 0 },
  { x: 60, y: 1 },
  { x: 60, y: 2 },

  { x: 70, y: 0 },
  { x: 70, y: 1 },
  { x: 70, y: 2 },

  { x: 80, y: 0 },
  { x: 80, y: 1 },
  { x: 80, y: 2 },

  { x: 90, y: 0 },
  { x: 90, y: 1 },
  { x: 90, y: 2 },

  { x: 100, y: 0 },
  { x: 100, y: 1 },
  { x: 100, y: 2 }

];

// window.$_life = require('./lib/game-of-life');

let life = require('./lib/game-of-life');
life.seed(controlState);

(function go() {

  console.log(life.state);
  life.generate();

  setTimeout(_ => {
    go();
  }, 400);

})();

},{"./lib/game-of-life":2}],2:[function(require,module,exports){
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

},{"./seed.js":3,"./surveyor.js":4}],3:[function(require,module,exports){
'use strict';

const ROUND = Math.round;
const RAND = Math.random;

module.exports = function Seed(limitX, limitY) {

  if(Array.isArray(limitX)) {
    return limitX;
  }

  limitX = limitX || 6;
  limitY = limitY || limitX;

  let upperX = ROUND(limitX / 2)
    , upperY = ROUND(limitY / 2)
    , lowerX = upperX - limitX
    , lowerY = upperY - limitY
    , x = lowerX
    , y = lowerY
    , coords = [];

  while(x++ < upperX) {
    while(y++ < upperY) {
      if(!!ROUND(RAND())) {
        coords.push({ x: x, y: y });
      }
    }
    y = lowerY;
  }

  return coords;
};

},{}],4:[function(require,module,exports){
'use strict';

module.exports = (function Surveyor() {

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
      if(x === 0 && y === 0) {
        return;
      } else {
        neighbor = offset(target, x, y);
        if(exists(neighbor, world)) {
          total += 1;
        }
      }
    });
    return total;
  };

  const potentialInfluence = (target, world, tracked) => {
    var possibleLocations = []
      , neighbor, untracked, comeToLife;

    survey(1, (x, y) => {
      if(x === 0 && y === 0) {
        return;
      } else {
        neighbor = offset(target, x, y);
        untracked = !exists(neighbor, world) && !exists(neighbor, tracked);
        comeToLife = countNeighbors(neighbor, world) === 3;
        if(untracked && comeToLife) {
          possibleLocations.push(neighbor);
        }
      }
    });
    return possibleLocations;
  };

  return {
    countNeighbors: countNeighbors,
    potentialInfluence: potentialInfluence
  };
  
})();

},{}]},{},[1]);
