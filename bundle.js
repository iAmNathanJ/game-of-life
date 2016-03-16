(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

window.$_life = require('./lib/game-of-life');

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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsImxpYi9nYW1lLW9mLWxpZmUuanMiLCJsaWIvc2VlZC5qcyIsImxpYi9zdXJ2ZXlvci5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RlZXAtZXF1YWwvbGliL2lzX2FyZ3VtZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2xpYi9rZXlzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0Jztcblxud2luZG93LiRfbGlmZSA9IHJlcXVpcmUoJy4vbGliL2dhbWUtb2YtbGlmZScpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBzZWVkID0gcmVxdWlyZSgnLi9zZWVkLmpzJyk7XG5jb25zdCBzdXJ2ZXlvciA9IHJlcXVpcmUoJy4vc3VydmV5b3IuanMnKTtcblxuY29uc3QgcnVsZXMgPSB7XG4gIHN1cnZpdm9ycyhuZWlnaGJvcnMpIHtcbiAgICByZXR1cm4gbmVpZ2hib3JzID4gMSAmJiBuZWlnaGJvcnMgPCA0O1xuICB9LFxuICBuZXdMaWZlKG5laWdoYm9ycykge1xuICAgIHJldHVybiBuZWlnaGJvcnMgPT09IDM7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uIExpZmUoKSB7XG5cbiAgbGV0IHN0YXRlID0gW107XG5cbiAgbGV0IGFwaSA9IHtcblxuICAgIGdlbmVyYXRlKCkge1xuICAgICAgbGV0IG5laWdoYm9ycztcblxuICAgICAgbGV0IHN1cnZpdm9ycyA9IHN0YXRlLmZpbHRlcihsb2NhdGlvbiA9PiB7XG4gICAgICAgIG5laWdoYm9ycyA9IHN1cnZleW9yLmNvdW50TmVpZ2hib3JzKGxvY2F0aW9uLCBzdGF0ZSk7XG4gICAgICAgIHJldHVybiBydWxlcy5zdXJ2aXZvcnMobmVpZ2hib3JzKTtcbiAgICAgIH0pO1xuXG4gICAgICBsZXQgcG90ZW50aWFsTGlmZSA9IHN0YXRlLnJlZHVjZSgoY2FuZGlkYXRlcywgbG9jYXRpb24pID0+IHtcbiAgICAgICAgbmVpZ2hib3JzID0gc3VydmV5b3IucG90ZW50aWFsSW5mbHVlbmNlKGxvY2F0aW9uLCBzdGF0ZSwgY2FuZGlkYXRlcyk7XG4gICAgICAgIHJldHVybiBjYW5kaWRhdGVzLmNvbmNhdChuZWlnaGJvcnMpO1xuICAgICAgfSwgW10pO1xuXG4gICAgICBsZXQgbmV3TGlmZSA9IHBvdGVudGlhbExpZmUuZmlsdGVyKGxvY2F0aW9uID0+IHtcbiAgICAgICAgbmVpZ2hib3JzID0gc3VydmV5b3IuY291bnROZWlnaGJvcnMobG9jYXRpb24sIHN0YXRlKTtcbiAgICAgICAgcmV0dXJuIHJ1bGVzLm5ld0xpZmUobmVpZ2hib3JzKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gc3RhdGUgPSBzdXJ2aXZvcnMuY29uY2F0KG5ld0xpZmUpO1xuICAgIH1cbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYXBpLCAnc2VlZCcsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICAgICAgc3RhdGUgPSBzZWVkKHdpZHRoLCBoZWlnaHQpO1xuICAgIH0sXG4gICAgd3JpdGFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogZmFsc2VcbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGFwaSwgJ3N0YXRlJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gYXBpO1xuXG59KSgpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBST1VORCA9IE1hdGgucm91bmQ7XG5jb25zdCBSQU5EID0gTWF0aC5yYW5kb207XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gU2VlZChsaW1pdFgsIGxpbWl0WSkge1xuXG4gIGlmKEFycmF5LmlzQXJyYXkobGltaXRYKSkge1xuICAgIHJldHVybiBsaW1pdFg7XG4gIH1cblxuICBsaW1pdFggPSBsaW1pdFggfHwgNjtcbiAgbGltaXRZID0gbGltaXRZIHx8IGxpbWl0WDtcblxuXG4gIGxldCB1cHBlclggPSBST1VORChsaW1pdFggLyAyKVxuICAgICwgdXBwZXJZID0gUk9VTkQobGltaXRZIC8gMilcbiAgICAsIGxvd2VyWCA9IHVwcGVyWCAtIGxpbWl0WFxuICAgICwgbG93ZXJZID0gdXBwZXJZIC0gbGltaXRZXG4gICAgLCB4ID0gbG93ZXJYXG4gICAgLCB5ID0gbG93ZXJZXG4gICAgLCBjb29yZHMgPSBbXTtcblxuICB3aGlsZSh4KysgPCB1cHBlclgpIHtcbiAgICB3aGlsZSh5KysgPCB1cHBlclkpIHtcbiAgICAgIGlmKCEhUk9VTkQoUkFORCgpKSkge1xuICAgICAgICBjb29yZHMucHVzaCh7IHg6IHgsIHk6IHkgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHkgPSBsb3dlclk7XG4gIH1cblxuICByZXR1cm4gY29vcmRzO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgZGVlcEVxdWFsID0gcmVxdWlyZSgnZGVlcC1lcXVhbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiBTdXJ2ZXlvcihfM0QpIHtcblxuICBjb25zdCBleGlzdHMgPSAodGFyZ2V0LCB3b3JsZCkgPT4ge1xuICAgIHJldHVybiB3b3JsZC5maW5kKCh2YWwpID0+IHtcbiAgICAgIHJldHVybiBkZWVwRXF1YWwodGFyZ2V0LCB2YWwpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vID09PT09PT09PT09PT09PT1cbiAgLy8gMkRcbiAgLy8gPT09PT09PT09PT09PT09PVxuICBjb25zdCBzdXJ2ZXkgPSAocHJveGltaXR5LCBjYikgPT4ge1xuICAgIHByb3hpbWl0eSA9IE1hdGguYWJzKHByb3hpbWl0eSkgfHwgMTtcbiAgICBmb3IobGV0IHggPSAtcHJveGltaXR5OyB4IDw9IHByb3hpbWl0eTsgeCsrKSB7XG4gICAgICBmb3IobGV0IHkgPSAtcHJveGltaXR5OyB5IDw9IHByb3hpbWl0eTsgeSsrKSB7XG4gICAgICAgIGNiKHgsIHkpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBjb25zdCBvZmZzZXQgPSAodGFyZ2V0LCBvZmZzZXRYLCBvZmZzZXRZKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHRhcmdldC54ICsgb2Zmc2V0WCxcbiAgICAgIHk6IHRhcmdldC55ICsgb2Zmc2V0WVxuICAgIH07XG4gIH07XG5cbiAgY29uc3QgY291bnROZWlnaGJvcnMgPSAodGFyZ2V0LCB3b3JsZCkgPT4ge1xuICAgIGxldCB0b3RhbCA9IDA7XG4gICAgc3VydmV5KDEsICh4LCB5KSA9PiB7XG4gICAgICBpZih4ID09PSAwICYmIHkgPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IG5laWdoYm9yID0gb2Zmc2V0KHRhcmdldCwgeCwgeSk7XG4gICAgICAgIGlmKGV4aXN0cyhuZWlnaGJvciwgd29ybGQpKSB7XG4gICAgICAgICAgdG90YWwgKz0gMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0b3RhbDtcbiAgfTtcblxuICBjb25zdCBwb3RlbnRpYWxJbmZsdWVuY2UgPSAodGFyZ2V0LCB3b3JsZCwgdHJhY2tlZCkgPT4ge1xuICAgIGxldCBwb3NzaWJsZUxvY2F0aW9ucyA9IFtdO1xuXG4gICAgc3VydmV5KDEsICh4LCB5KSA9PiB7XG4gICAgICBpZih4ID09PSAwICYmIHkgPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IG5laWdoYm9yICAgICAgPSBvZmZzZXQodGFyZ2V0LCB4LCB5KTtcbiAgICAgICAgbGV0IHVudHJhY2tlZCA9ICFleGlzdHMobmVpZ2hib3IsIHdvcmxkKSAmJiAhZXhpc3RzKG5laWdoYm9yLCB0cmFja2VkKTtcbiAgICAgICAgaWYodW50cmFja2VkKSB7XG4gICAgICAgICAgcG9zc2libGVMb2NhdGlvbnMucHVzaChuZWlnaGJvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcG9zc2libGVMb2NhdGlvbnM7XG4gIH07XG5cbiAgLy8gPT09PT09PT09PT09PT09PVxuICAvLyAzRFxuICAvLyA9PT09PT09PT09PT09PT09XG4gIGNvbnN0IHN1cnZleTNEID0gKHByb3hpbWl0eSwgY2IpID0+IHtcbiAgICBwcm94aW1pdHkgPSBNYXRoLmFicyhwcm94aW1pdHkpIHx8IDE7XG4gICAgZm9yKGxldCB4ID0gLXByb3hpbWl0eTsgeCA8PSBwcm94aW1pdHk7IHgrKykge1xuICAgICAgZm9yKGxldCB5ID0gLXByb3hpbWl0eTsgeSA8PSBwcm94aW1pdHk7IHkrKykge1xuICAgICAgICBmb3IobGV0IHogPSAtcHJveGltaXR5OyB6IDw9IHByb3hpbWl0eTsgeisrKSB7XG4gICAgICAgICAgY2IoeCwgeSwgeik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgb2Zmc2V0M0QgPSAodGFyZ2V0LCBvZmZzZXRYLCBvZmZzZXRZLCBvZmZzZXRaKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHRhcmdldC54ICsgb2Zmc2V0WCxcbiAgICAgIHk6IHRhcmdldC55ICsgb2Zmc2V0WSxcbiAgICAgIHo6IHRhcmdldC56ICsgb2Zmc2V0WlxuICAgIH07XG4gIH07XG5cbiAgY29uc3QgY291bnROZWlnaGJvcnMzRCA9ICh0YXJnZXQsIHdvcmxkKSA9PiB7XG4gICAgbGV0IHRvdGFsID0gMDtcbiAgICBzdXJ2ZXkzRCgxLCAoeCwgeSwgeikgPT4ge1xuICAgICAgaWYoeCAhPT0gMCAmJiB5ICE9PSAwICYmIHogIT09IDApIHtcbiAgICAgICAgbGV0IG5laWdoYm9yID0gb2Zmc2V0M0QodGFyZ2V0LCB4LCB5LCB6KTtcbiAgICAgICAgaWYoIWV4aXN0cyhuZWlnaGJvciwgd29ybGQpKSB7XG4gICAgICAgICAgdG90YWwgKz0gMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0b3RhbDtcbiAgfTtcblxuICBjb25zdCBwb3RlbnRpYWxJbmZsdWVuY2UzRCA9ICh0YXJnZXQsIHdvcmxkKSA9PiB7XG4gICAgcG9zc2libGVMb2NhdGlvbnMgPSBbXTtcbiAgICBzdXJ2ZXkzRCgxLCAoeCwgeSwgeikgPT4ge1xuICAgICAgbGV0IG5laWdoYm9yICAgICAgPSBvZmZzZXQzRCh0YXJnZXQsIHgsIHksIHopXG4gICAgICAgICwgYWxyZWFkeUxpdmluZyA9IGV4aXN0cyhuZWlnaGJvciwgd29ybGQpXG4gICAgICAgICwgYWxyZWFkeUxpc3RlZCA9IGV4aXN0cyhuZWlnaGJvciwgcG9zc2libGVMb2NhdGlvbnMpO1xuICAgICAgaWYoIWFscmVhZHlMaXZpbmcgJiYgIWFscmVhZHlMaXN0ZWQpIHtcbiAgICAgICAgcG9zc2libGVMb2NhdGlvbnMucHVzaChuZWlnaGJvcik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHBvc3NpYmxlTG9jYXRpb25zO1xuICB9O1xuXG4gIGlmKF8zRCkge1xuICAgIHJldHVybiB7XG4gICAgICBjb3VudE5laWdoYm9yczogY291bnROZWlnaGJvcnMzRCxcbiAgICAgIHBvdGVudGlhbEluZmx1ZW5jZTogcG90ZW50aWFsSW5mbHVlbmNlM0RcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB7XG4gICAgICBjb3VudE5laWdoYm9yczogY291bnROZWlnaGJvcnMsXG4gICAgICBwb3RlbnRpYWxJbmZsdWVuY2U6IHBvdGVudGlhbEluZmx1ZW5jZVxuICAgIH07XG4gIH1cblxufSkoKTtcbiIsInZhciBwU2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgb2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4vbGliL2tleXMuanMnKTtcbnZhciBpc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4vbGliL2lzX2FyZ3VtZW50cy5qcycpO1xuXG52YXIgZGVlcEVxdWFsID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCwgb3B0cykge1xuICBpZiAoIW9wdHMpIG9wdHMgPSB7fTtcbiAgLy8gNy4xLiBBbGwgaWRlbnRpY2FsIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG5cbiAgfSBlbHNlIGlmIChhY3R1YWwgaW5zdGFuY2VvZiBEYXRlICYmIGV4cGVjdGVkIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIHJldHVybiBhY3R1YWwuZ2V0VGltZSgpID09PSBleHBlY3RlZC5nZXRUaW1lKCk7XG5cbiAgLy8gNy4zLiBPdGhlciBwYWlycyB0aGF0IGRvIG5vdCBib3RoIHBhc3MgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnLFxuICAvLyBlcXVpdmFsZW5jZSBpcyBkZXRlcm1pbmVkIGJ5ID09LlxuICB9IGVsc2UgaWYgKCFhY3R1YWwgfHwgIWV4cGVjdGVkIHx8IHR5cGVvZiBhY3R1YWwgIT0gJ29iamVjdCcgJiYgdHlwZW9mIGV4cGVjdGVkICE9ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG9wdHMuc3RyaWN0ID8gYWN0dWFsID09PSBleHBlY3RlZCA6IGFjdHVhbCA9PSBleHBlY3RlZDtcblxuICAvLyA3LjQuIEZvciBhbGwgb3RoZXIgT2JqZWN0IHBhaXJzLCBpbmNsdWRpbmcgQXJyYXkgb2JqZWN0cywgZXF1aXZhbGVuY2UgaXNcbiAgLy8gZGV0ZXJtaW5lZCBieSBoYXZpbmcgdGhlIHNhbWUgbnVtYmVyIG9mIG93bmVkIHByb3BlcnRpZXMgKGFzIHZlcmlmaWVkXG4gIC8vIHdpdGggT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKSwgdGhlIHNhbWUgc2V0IG9mIGtleXNcbiAgLy8gKGFsdGhvdWdoIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZSBvcmRlciksIGVxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeVxuICAvLyBjb3JyZXNwb25kaW5nIGtleSwgYW5kIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS4gTm90ZTogdGhpc1xuICAvLyBhY2NvdW50cyBmb3IgYm90aCBuYW1lZCBhbmQgaW5kZXhlZCBwcm9wZXJ0aWVzIG9uIEFycmF5cy5cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb2JqRXF1aXYoYWN0dWFsLCBleHBlY3RlZCwgb3B0cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWRPck51bGwodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGlzQnVmZmVyICh4KSB7XG4gIGlmICgheCB8fCB0eXBlb2YgeCAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIHgubGVuZ3RoICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICBpZiAodHlwZW9mIHguY29weSAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgeC5zbGljZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoeC5sZW5ndGggPiAwICYmIHR5cGVvZiB4WzBdICE9PSAnbnVtYmVyJykgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gb2JqRXF1aXYoYSwgYiwgb3B0cykge1xuICB2YXIgaSwga2V5O1xuICBpZiAoaXNVbmRlZmluZWRPck51bGwoYSkgfHwgaXNVbmRlZmluZWRPck51bGwoYikpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvLyBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuXG4gIGlmIChhLnByb3RvdHlwZSAhPT0gYi5wcm90b3R5cGUpIHJldHVybiBmYWxzZTtcbiAgLy9+fn5JJ3ZlIG1hbmFnZWQgdG8gYnJlYWsgT2JqZWN0LmtleXMgdGhyb3VnaCBzY3Jld3kgYXJndW1lbnRzIHBhc3NpbmcuXG4gIC8vICAgQ29udmVydGluZyB0byBhcnJheSBzb2x2ZXMgdGhlIHByb2JsZW0uXG4gIGlmIChpc0FyZ3VtZW50cyhhKSkge1xuICAgIGlmICghaXNBcmd1bWVudHMoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYSA9IHBTbGljZS5jYWxsKGEpO1xuICAgIGIgPSBwU2xpY2UuY2FsbChiKTtcbiAgICByZXR1cm4gZGVlcEVxdWFsKGEsIGIsIG9wdHMpO1xuICB9XG4gIGlmIChpc0J1ZmZlcihhKSkge1xuICAgIGlmICghaXNCdWZmZXIoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgIGZvciAoaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYVtpXSAhPT0gYltpXSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB0cnkge1xuICAgIHZhciBrYSA9IG9iamVjdEtleXMoYSksXG4gICAgICAgIGtiID0gb2JqZWN0S2V5cyhiKTtcbiAgfSBjYXRjaCAoZSkgey8vaGFwcGVucyB3aGVuIG9uZSBpcyBhIHN0cmluZyBsaXRlcmFsIGFuZCB0aGUgb3RoZXIgaXNuJ3RcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChrZXlzIGluY29ycG9yYXRlc1xuICAvLyBoYXNPd25Qcm9wZXJ0eSlcbiAgaWYgKGthLmxlbmd0aCAhPSBrYi5sZW5ndGgpXG4gICAgcmV0dXJuIGZhbHNlO1xuICAvL3RoZSBzYW1lIHNldCBvZiBrZXlzIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLFxuICBrYS5zb3J0KCk7XG4gIGtiLnNvcnQoKTtcbiAgLy9+fn5jaGVhcCBrZXkgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChrYVtpXSAhPSBrYltpXSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvL2VxdWl2YWxlbnQgdmFsdWVzIGZvciBldmVyeSBjb3JyZXNwb25kaW5nIGtleSwgYW5kXG4gIC8vfn5+cG9zc2libHkgZXhwZW5zaXZlIGRlZXAgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGtleSA9IGthW2ldO1xuICAgIGlmICghZGVlcEVxdWFsKGFba2V5XSwgYltrZXldLCBvcHRzKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0eXBlb2YgYSA9PT0gdHlwZW9mIGI7XG59XG4iLCJ2YXIgc3VwcG9ydHNBcmd1bWVudHNDbGFzcyA9IChmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZ3VtZW50cylcbn0pKCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHN1cHBvcnRzQXJndW1lbnRzQ2xhc3MgPyBzdXBwb3J0ZWQgOiB1bnN1cHBvcnRlZDtcblxuZXhwb3J0cy5zdXBwb3J0ZWQgPSBzdXBwb3J0ZWQ7XG5mdW5jdGlvbiBzdXBwb3J0ZWQob2JqZWN0KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PSAnW29iamVjdCBBcmd1bWVudHNdJztcbn07XG5cbmV4cG9ydHMudW5zdXBwb3J0ZWQgPSB1bnN1cHBvcnRlZDtcbmZ1bmN0aW9uIHVuc3VwcG9ydGVkKG9iamVjdCl7XG4gIHJldHVybiBvYmplY3QgJiZcbiAgICB0eXBlb2Ygb2JqZWN0ID09ICdvYmplY3QnICYmXG4gICAgdHlwZW9mIG9iamVjdC5sZW5ndGggPT0gJ251bWJlcicgJiZcbiAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCAnY2FsbGVlJykgJiZcbiAgICAhT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKG9iamVjdCwgJ2NhbGxlZScpIHx8XG4gICAgZmFsc2U7XG59O1xuIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gdHlwZW9mIE9iamVjdC5rZXlzID09PSAnZnVuY3Rpb24nXG4gID8gT2JqZWN0LmtleXMgOiBzaGltO1xuXG5leHBvcnRzLnNoaW0gPSBzaGltO1xuZnVuY3Rpb24gc2hpbSAob2JqKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIGtleXMucHVzaChrZXkpO1xuICByZXR1cm4ga2V5cztcbn1cbiJdfQ==
