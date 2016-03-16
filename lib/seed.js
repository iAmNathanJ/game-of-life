'use strict';

const ROUND = Math.round;
const RAND = Math.random;

module.exports = function Seed(limitX, limitY) {

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
