(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

const life = require('./lib/game-of-life');

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

      let survivors = state.filter(location => {
        neighbors = surveyor.countNeighbors(location, state);
        return rules.survivors(neighbors);
      });

      let potentialLife = state.reduce((candidates, location) => {
        neighbors = surveyor.potentialInfluence(location, state, candidates);
        return candidates.concat(neighbors);
      }, []);

      let newLife = potentialLife.filter(location => {
        neighbors = surveyor.countNeighbors(location, state);
        return rules.newLife(neighbors);
      });

      return state = survivors.concat(newLife);
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

const deepEqual = require('deep-equal');

module.exports = (function Surveyor(_3D) {

  const exists = (target, world) => {
    return world.find((val) => {
      return deepEqual(target, val);
    });
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
          total += 1;
        }
      }
    });
    return total;
  };

  const potentialInfluence = (target, world, tracked) => {
    let possibleLocations = [];

    survey(1, (x, y) => {
      if(x === 0 && y === 0) {
        return;
      } else {
        let neighbor      = offset(target, x, y);
        let untracked = !exists(neighbor, world) && !exists(neighbor, tracked);
        if(untracked) {
          possibleLocations.push(neighbor);
        }
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

},{"deep-equal":5}],5:[function(require,module,exports){
var pSlice = Array.prototype.slice;
var objectKeys = require('./lib/keys.js');
var isArguments = require('./lib/is_arguments.js');

var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) opts = {};
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer (x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') return false;
  return true;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  if (isBuffer(a)) {
    if (!isBuffer(b)) {
      return false;
    }
    if (a.length !== b.length) return false;
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) return false;
  }
  return typeof a === typeof b;
}

},{"./lib/is_arguments.js":6,"./lib/keys.js":7}],6:[function(require,module,exports){
var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
};

exports.unsupported = unsupported;
function unsupported(object){
  return object &&
    typeof object == 'object' &&
    typeof object.length == 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
};

},{}],7:[function(require,module,exports){
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}

},{}]},{},[1]);
