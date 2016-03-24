'use strict';

const ROUND = Math.round;
const CEIL = Math.ceil;
const RAND = Math.random;

module.exports = function Seed(w, h) {

  if(Array.isArray(w)) {
    return w;
  }

  let width = w || 6;
  let height = h || width;

  let upperX = CEIL(width / 2)
    , upperY = CEIL(height / 2)
    , lowerX = CEIL(-width / 2)
    , lowerY = CEIL(-height / 2)
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
