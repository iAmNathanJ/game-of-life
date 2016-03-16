(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

const life = require('./lib/game-of-life');

life.seed([
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 }
]);

life.generate();
console.log(life.state);

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

// const findIndex = require('lodash.findindex');
// const assert = require('assert');
const deepEqual = require('deep-equal');

module.exports = (function Surveyor(_3D) {

  const exists = (target, world) => {

    // return findIndex(world, target) >= 0;

    return world.findIndex((val) => {
      return deepEqual(target, val);
    }) >= 0;

    // let x = world.findIndex((val) => {
    //   return Object.is(Object.valueOf(target), Object.valueOf(val));
    // });
    // console.log(x);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsImxpYi9nYW1lLW9mLWxpZmUuanMiLCJsaWIvc2VlZC5qcyIsImxpYi9zdXJ2ZXlvci5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RlZXAtZXF1YWwvbGliL2lzX2FyZ3VtZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9kZWVwLWVxdWFsL2xpYi9rZXlzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBsaWZlID0gcmVxdWlyZSgnLi9saWIvZ2FtZS1vZi1saWZlJyk7XG5cbmxpZmUuc2VlZChbXG4gIHsgeDogMCwgeTogMCB9LFxuICB7IHg6IDEsIHk6IDAgfSxcbiAgeyB4OiAwLCB5OiAxIH1cbl0pO1xuXG5saWZlLmdlbmVyYXRlKCk7XG5jb25zb2xlLmxvZyhsaWZlLnN0YXRlKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3Qgc2VlZCA9IHJlcXVpcmUoJy4vc2VlZC5qcycpO1xuY29uc3Qgc3VydmV5b3IgPSByZXF1aXJlKCcuL3N1cnZleW9yLmpzJyk7XG5cbmNvbnN0IHJ1bGVzID0ge1xuICBzdXJ2aXZvcnMobmVpZ2hib3JzKSB7XG4gICAgcmV0dXJuIG5laWdoYm9ycyA+IDEgJiYgbmVpZ2hib3JzIDwgNDtcbiAgfSxcbiAgbmV3TGlmZShuZWlnaGJvcnMpIHtcbiAgICByZXR1cm4gbmVpZ2hib3JzID09PSAzO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiBMaWZlKCkge1xuXG4gIGxldCBzdGF0ZSA9IFtdO1xuXG4gIGxldCBhcGkgPSB7XG5cbiAgICBnZW5lcmF0ZSgpIHtcbiAgICAgIGxldCBuZWlnaGJvcnM7XG5cbiAgICAgIGxldCBzdXJ2aXZvcnMgPSBzdGF0ZS5maWx0ZXIobG9jYXRpb24gPT4ge1xuICAgICAgICBuZWlnaGJvcnMgPSBzdXJ2ZXlvci5jb3VudE5laWdoYm9ycyhsb2NhdGlvbiwgc3RhdGUpO1xuICAgICAgICByZXR1cm4gcnVsZXMuc3Vydml2b3JzKG5laWdoYm9ycyk7XG4gICAgICB9KTtcblxuICAgICAgbGV0IHBvdGVudGlhbExpZmUgPSBzdGF0ZS5yZWR1Y2UoKGNhbmRpZGF0ZXMsIGxvY2F0aW9uKSA9PiB7XG4gICAgICAgIG5laWdoYm9ycyA9IHN1cnZleW9yLnBvdGVudGlhbEluZmx1ZW5jZShsb2NhdGlvbiwgc3RhdGUsIGNhbmRpZGF0ZXMpO1xuICAgICAgICByZXR1cm4gY2FuZGlkYXRlcy5jb25jYXQobmVpZ2hib3JzKTtcbiAgICAgIH0sIFtdKTtcblxuICAgICAgbGV0IG5ld0xpZmUgPSBwb3RlbnRpYWxMaWZlLmZpbHRlcihsb2NhdGlvbiA9PiB7XG4gICAgICAgIG5laWdoYm9ycyA9IHN1cnZleW9yLmNvdW50TmVpZ2hib3JzKGxvY2F0aW9uLCBzdGF0ZSk7XG4gICAgICAgIHJldHVybiBydWxlcy5uZXdMaWZlKG5laWdoYm9ycyk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHN0YXRlID0gc3Vydml2b3JzLmNvbmNhdChuZXdMaWZlKTtcbiAgICB9XG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGFwaSwgJ3NlZWQnLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgIHN0YXRlID0gc2VlZCh3aWR0aCwgaGVpZ2h0KTtcbiAgICB9LFxuICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IGZhbHNlXG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShhcGksICdzdGF0ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGFwaTtcblxufSkoKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgUk9VTkQgPSBNYXRoLnJvdW5kO1xuY29uc3QgUkFORCA9IE1hdGgucmFuZG9tO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFNlZWQobGltaXRYLCBsaW1pdFkpIHtcblxuICBpZihBcnJheS5pc0FycmF5KGxpbWl0WCkpIHtcbiAgICByZXR1cm4gbGltaXRYO1xuICB9XG5cbiAgbGltaXRYID0gbGltaXRYIHx8IDY7XG4gIGxpbWl0WSA9IGxpbWl0WSB8fCBsaW1pdFg7XG5cblxuICBsZXQgdXBwZXJYID0gUk9VTkQobGltaXRYIC8gMilcbiAgICAsIHVwcGVyWSA9IFJPVU5EKGxpbWl0WSAvIDIpXG4gICAgLCBsb3dlclggPSB1cHBlclggLSBsaW1pdFhcbiAgICAsIGxvd2VyWSA9IHVwcGVyWSAtIGxpbWl0WVxuICAgICwgeCA9IGxvd2VyWFxuICAgICwgeSA9IGxvd2VyWVxuICAgICwgY29vcmRzID0gW107XG5cbiAgd2hpbGUoeCsrIDwgdXBwZXJYKSB7XG4gICAgd2hpbGUoeSsrIDwgdXBwZXJZKSB7XG4gICAgICBpZighIVJPVU5EKFJBTkQoKSkpIHtcbiAgICAgICAgY29vcmRzLnB1c2goeyB4OiB4LCB5OiB5IH0pO1xuICAgICAgfVxuICAgIH1cbiAgICB5ID0gbG93ZXJZO1xuICB9XG5cbiAgcmV0dXJuIGNvb3Jkcztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIGNvbnN0IGZpbmRJbmRleCA9IHJlcXVpcmUoJ2xvZGFzaC5maW5kaW5kZXgnKTtcbi8vIGNvbnN0IGFzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuY29uc3QgZGVlcEVxdWFsID0gcmVxdWlyZSgnZGVlcC1lcXVhbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiBTdXJ2ZXlvcihfM0QpIHtcblxuICBjb25zdCBleGlzdHMgPSAodGFyZ2V0LCB3b3JsZCkgPT4ge1xuXG4gICAgLy8gcmV0dXJuIGZpbmRJbmRleCh3b3JsZCwgdGFyZ2V0KSA+PSAwO1xuXG4gICAgcmV0dXJuIHdvcmxkLmZpbmRJbmRleCgodmFsKSA9PiB7XG4gICAgICByZXR1cm4gZGVlcEVxdWFsKHRhcmdldCwgdmFsKTtcbiAgICB9KSA+PSAwO1xuXG4gICAgLy8gbGV0IHggPSB3b3JsZC5maW5kSW5kZXgoKHZhbCkgPT4ge1xuICAgIC8vICAgcmV0dXJuIE9iamVjdC5pcyhPYmplY3QudmFsdWVPZih0YXJnZXQpLCBPYmplY3QudmFsdWVPZih2YWwpKTtcbiAgICAvLyB9KTtcbiAgICAvLyBjb25zb2xlLmxvZyh4KTtcbiAgfTtcblxuICAvLyA9PT09PT09PT09PT09PT09XG4gIC8vIDJEXG4gIC8vID09PT09PT09PT09PT09PT1cbiAgY29uc3Qgc3VydmV5ID0gKHByb3hpbWl0eSwgY2IpID0+IHtcbiAgICBwcm94aW1pdHkgPSBNYXRoLmFicyhwcm94aW1pdHkpIHx8IDE7XG4gICAgZm9yKGxldCB4ID0gLXByb3hpbWl0eTsgeCA8PSBwcm94aW1pdHk7IHgrKykge1xuICAgICAgZm9yKGxldCB5ID0gLXByb3hpbWl0eTsgeSA8PSBwcm94aW1pdHk7IHkrKykge1xuICAgICAgICBjYih4LCB5KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgb2Zmc2V0ID0gKHRhcmdldCwgb2Zmc2V0WCwgb2Zmc2V0WSkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICB4OiB0YXJnZXQueCArIG9mZnNldFgsXG4gICAgICB5OiB0YXJnZXQueSArIG9mZnNldFlcbiAgICB9O1xuICB9O1xuXG4gIGNvbnN0IGNvdW50TmVpZ2hib3JzID0gKHRhcmdldCwgd29ybGQpID0+IHtcbiAgICBsZXQgdG90YWwgPSAwO1xuICAgIHN1cnZleSgxLCAoeCwgeSkgPT4ge1xuICAgICAgaWYoeCA9PT0gMCAmJiB5ID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBuZWlnaGJvciA9IG9mZnNldCh0YXJnZXQsIHgsIHkpO1xuICAgICAgICBpZihleGlzdHMobmVpZ2hib3IsIHdvcmxkKSkge1xuICAgICAgICAgIHRvdGFsICs9IDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdG90YWw7XG4gIH07XG5cbiAgY29uc3QgcG90ZW50aWFsSW5mbHVlbmNlID0gKHRhcmdldCwgd29ybGQsIHRyYWNrZWQpID0+IHtcbiAgICBsZXQgcG9zc2libGVMb2NhdGlvbnMgPSBbXTtcblxuICAgIHN1cnZleSgxLCAoeCwgeSkgPT4ge1xuICAgICAgaWYoeCA9PT0gMCAmJiB5ID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBuZWlnaGJvciAgICAgID0gb2Zmc2V0KHRhcmdldCwgeCwgeSk7XG4gICAgICAgIGxldCB1bnRyYWNrZWQgPSAhZXhpc3RzKG5laWdoYm9yLCB3b3JsZCkgJiYgIWV4aXN0cyhuZWlnaGJvciwgdHJhY2tlZCk7XG4gICAgICAgIGlmKHVudHJhY2tlZCkge1xuICAgICAgICAgIHBvc3NpYmxlTG9jYXRpb25zLnB1c2gobmVpZ2hib3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHBvc3NpYmxlTG9jYXRpb25zO1xuICB9O1xuXG4gIC8vID09PT09PT09PT09PT09PT1cbiAgLy8gM0RcbiAgLy8gPT09PT09PT09PT09PT09PVxuICBjb25zdCBzdXJ2ZXkzRCA9IChwcm94aW1pdHksIGNiKSA9PiB7XG4gICAgcHJveGltaXR5ID0gTWF0aC5hYnMocHJveGltaXR5KSB8fCAxO1xuICAgIGZvcihsZXQgeCA9IC1wcm94aW1pdHk7IHggPD0gcHJveGltaXR5OyB4KyspIHtcbiAgICAgIGZvcihsZXQgeSA9IC1wcm94aW1pdHk7IHkgPD0gcHJveGltaXR5OyB5KyspIHtcbiAgICAgICAgZm9yKGxldCB6ID0gLXByb3hpbWl0eTsgeiA8PSBwcm94aW1pdHk7IHorKykge1xuICAgICAgICAgIGNiKHgsIHksIHopO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IG9mZnNldDNEID0gKHRhcmdldCwgb2Zmc2V0WCwgb2Zmc2V0WSwgb2Zmc2V0WikgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICB4OiB0YXJnZXQueCArIG9mZnNldFgsXG4gICAgICB5OiB0YXJnZXQueSArIG9mZnNldFksXG4gICAgICB6OiB0YXJnZXQueiArIG9mZnNldFpcbiAgICB9O1xuICB9O1xuXG4gIGNvbnN0IGNvdW50TmVpZ2hib3JzM0QgPSAodGFyZ2V0LCB3b3JsZCkgPT4ge1xuICAgIGxldCB0b3RhbCA9IDA7XG4gICAgc3VydmV5M0QoMSwgKHgsIHksIHopID0+IHtcbiAgICAgIGlmKHggIT09IDAgJiYgeSAhPT0gMCAmJiB6ICE9PSAwKSB7XG4gICAgICAgIGxldCBuZWlnaGJvciA9IG9mZnNldDNEKHRhcmdldCwgeCwgeSwgeik7XG4gICAgICAgIGlmKCFleGlzdHMobmVpZ2hib3IsIHdvcmxkKSkge1xuICAgICAgICAgIHRvdGFsICs9IDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdG90YWw7XG4gIH07XG5cbiAgY29uc3QgcG90ZW50aWFsSW5mbHVlbmNlM0QgPSAodGFyZ2V0LCB3b3JsZCkgPT4ge1xuICAgIHBvc3NpYmxlTG9jYXRpb25zID0gW107XG4gICAgc3VydmV5M0QoMSwgKHgsIHksIHopID0+IHtcbiAgICAgIGxldCBuZWlnaGJvciAgICAgID0gb2Zmc2V0M0QodGFyZ2V0LCB4LCB5LCB6KVxuICAgICAgICAsIGFscmVhZHlMaXZpbmcgPSBleGlzdHMobmVpZ2hib3IsIHdvcmxkKVxuICAgICAgICAsIGFscmVhZHlMaXN0ZWQgPSBleGlzdHMobmVpZ2hib3IsIHBvc3NpYmxlTG9jYXRpb25zKTtcbiAgICAgIGlmKCFhbHJlYWR5TGl2aW5nICYmICFhbHJlYWR5TGlzdGVkKSB7XG4gICAgICAgIHBvc3NpYmxlTG9jYXRpb25zLnB1c2gobmVpZ2hib3IpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBwb3NzaWJsZUxvY2F0aW9ucztcbiAgfTtcblxuICBpZihfM0QpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY291bnROZWlnaGJvcnM6IGNvdW50TmVpZ2hib3JzM0QsXG4gICAgICBwb3RlbnRpYWxJbmZsdWVuY2U6IHBvdGVudGlhbEluZmx1ZW5jZTNEXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4ge1xuICAgICAgY291bnROZWlnaGJvcnM6IGNvdW50TmVpZ2hib3JzLFxuICAgICAgcG90ZW50aWFsSW5mbHVlbmNlOiBwb3RlbnRpYWxJbmZsdWVuY2VcbiAgICB9O1xuICB9XG5cbn0pKCk7XG4iLCJ2YXIgcFNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIG9iamVjdEtleXMgPSByZXF1aXJlKCcuL2xpYi9rZXlzLmpzJyk7XG52YXIgaXNBcmd1bWVudHMgPSByZXF1aXJlKCcuL2xpYi9pc19hcmd1bWVudHMuanMnKTtcblxudmFyIGRlZXBFcXVhbCA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGFjdHVhbCwgZXhwZWN0ZWQsIG9wdHMpIHtcbiAgaWYgKCFvcHRzKSBvcHRzID0ge307XG4gIC8vIDcuMS4gQWxsIGlkZW50aWNhbCB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGFzIGRldGVybWluZWQgYnkgPT09LlxuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkge1xuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSBpZiAoYWN0dWFsIGluc3RhbmNlb2YgRGF0ZSAmJiBleHBlY3RlZCBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICByZXR1cm4gYWN0dWFsLmdldFRpbWUoKSA9PT0gZXhwZWN0ZWQuZ2V0VGltZSgpO1xuXG4gIC8vIDcuMy4gT3RoZXIgcGFpcnMgdGhhdCBkbyBub3QgYm90aCBwYXNzIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyxcbiAgLy8gZXF1aXZhbGVuY2UgaXMgZGV0ZXJtaW5lZCBieSA9PS5cbiAgfSBlbHNlIGlmICghYWN0dWFsIHx8ICFleHBlY3RlZCB8fCB0eXBlb2YgYWN0dWFsICE9ICdvYmplY3QnICYmIHR5cGVvZiBleHBlY3RlZCAhPSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBvcHRzLnN0cmljdCA/IGFjdHVhbCA9PT0gZXhwZWN0ZWQgOiBhY3R1YWwgPT0gZXhwZWN0ZWQ7XG5cbiAgLy8gNy40LiBGb3IgYWxsIG90aGVyIE9iamVjdCBwYWlycywgaW5jbHVkaW5nIEFycmF5IG9iamVjdHMsIGVxdWl2YWxlbmNlIGlzXG4gIC8vIGRldGVybWluZWQgYnkgaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChhcyB2ZXJpZmllZFxuICAvLyB3aXRoIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCksIHRoZSBzYW1lIHNldCBvZiBrZXlzXG4gIC8vIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLCBlcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnlcbiAgLy8gY29ycmVzcG9uZGluZyBrZXksIGFuZCBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuIE5vdGU6IHRoaXNcbiAgLy8gYWNjb3VudHMgZm9yIGJvdGggbmFtZWQgYW5kIGluZGV4ZWQgcHJvcGVydGllcyBvbiBBcnJheXMuXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9iakVxdWl2KGFjdHVhbCwgZXhwZWN0ZWQsIG9wdHMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkT3JOdWxsKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBpc0J1ZmZlciAoeCkge1xuICBpZiAoIXggfHwgdHlwZW9mIHggIT09ICdvYmplY3QnIHx8IHR5cGVvZiB4Lmxlbmd0aCAhPT0gJ251bWJlcicpIHJldHVybiBmYWxzZTtcbiAgaWYgKHR5cGVvZiB4LmNvcHkgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIHguc2xpY2UgIT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHgubGVuZ3RoID4gMCAmJiB0eXBlb2YgeFswXSAhPT0gJ251bWJlcicpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIG9iakVxdWl2KGEsIGIsIG9wdHMpIHtcbiAgdmFyIGksIGtleTtcbiAgaWYgKGlzVW5kZWZpbmVkT3JOdWxsKGEpIHx8IGlzVW5kZWZpbmVkT3JOdWxsKGIpKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy8gYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LlxuICBpZiAoYS5wcm90b3R5cGUgIT09IGIucHJvdG90eXBlKSByZXR1cm4gZmFsc2U7XG4gIC8vfn5+SSd2ZSBtYW5hZ2VkIHRvIGJyZWFrIE9iamVjdC5rZXlzIHRocm91Z2ggc2NyZXd5IGFyZ3VtZW50cyBwYXNzaW5nLlxuICAvLyAgIENvbnZlcnRpbmcgdG8gYXJyYXkgc29sdmVzIHRoZSBwcm9ibGVtLlxuICBpZiAoaXNBcmd1bWVudHMoYSkpIHtcbiAgICBpZiAoIWlzQXJndW1lbnRzKGIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGEgPSBwU2xpY2UuY2FsbChhKTtcbiAgICBiID0gcFNsaWNlLmNhbGwoYik7XG4gICAgcmV0dXJuIGRlZXBFcXVhbChhLCBiLCBvcHRzKTtcbiAgfVxuICBpZiAoaXNCdWZmZXIoYSkpIHtcbiAgICBpZiAoIWlzQnVmZmVyKGIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGFbaV0gIT09IGJbaV0pIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdHJ5IHtcbiAgICB2YXIga2EgPSBvYmplY3RLZXlzKGEpLFxuICAgICAgICBrYiA9IG9iamVjdEtleXMoYik7XG4gIH0gY2F0Y2ggKGUpIHsvL2hhcHBlbnMgd2hlbiBvbmUgaXMgYSBzdHJpbmcgbGl0ZXJhbCBhbmQgdGhlIG90aGVyIGlzbid0XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoa2V5cyBpbmNvcnBvcmF0ZXNcbiAgLy8gaGFzT3duUHJvcGVydHkpXG4gIGlmIChrYS5sZW5ndGggIT0ga2IubGVuZ3RoKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy90aGUgc2FtZSBzZXQgb2Yga2V5cyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSxcbiAga2Euc29ydCgpO1xuICBrYi5zb3J0KCk7XG4gIC8vfn5+Y2hlYXAga2V5IHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoa2FbaV0gIT0ga2JbaV0pXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy9lcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnkgY29ycmVzcG9uZGluZyBrZXksIGFuZFxuICAvL35+fnBvc3NpYmx5IGV4cGVuc2l2ZSBkZWVwIHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBrZXkgPSBrYVtpXTtcbiAgICBpZiAoIWRlZXBFcXVhbChhW2tleV0sIGJba2V5XSwgb3B0cykpIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHlwZW9mIGEgPT09IHR5cGVvZiBiO1xufVxuIiwidmFyIHN1cHBvcnRzQXJndW1lbnRzQ2xhc3MgPSAoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcmd1bWVudHMpXG59KSgpID09ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBzdXBwb3J0c0FyZ3VtZW50c0NsYXNzID8gc3VwcG9ydGVkIDogdW5zdXBwb3J0ZWQ7XG5cbmV4cG9ydHMuc3VwcG9ydGVkID0gc3VwcG9ydGVkO1xuZnVuY3Rpb24gc3VwcG9ydGVkKG9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG59O1xuXG5leHBvcnRzLnVuc3VwcG9ydGVkID0gdW5zdXBwb3J0ZWQ7XG5mdW5jdGlvbiB1bnN1cHBvcnRlZChvYmplY3Qpe1xuICByZXR1cm4gb2JqZWN0ICYmXG4gICAgdHlwZW9mIG9iamVjdCA9PSAnb2JqZWN0JyAmJlxuICAgIHR5cGVvZiBvYmplY3QubGVuZ3RoID09ICdudW1iZXInICYmXG4gICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgJ2NhbGxlZScpICYmXG4gICAgIU9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChvYmplY3QsICdjYWxsZWUnKSB8fFxuICAgIGZhbHNlO1xufTtcbiIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiBPYmplY3Qua2V5cyA9PT0gJ2Z1bmN0aW9uJ1xuICA/IE9iamVjdC5rZXlzIDogc2hpbTtcblxuZXhwb3J0cy5zaGltID0gc2hpbTtcbmZ1bmN0aW9uIHNoaW0gKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSBrZXlzLnB1c2goa2V5KTtcbiAgcmV0dXJuIGtleXM7XG59XG4iXX0=
