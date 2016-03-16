'use strict';

const life = require('./lib/game-of-life');

life.seed([
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 }
]);

life.generate();
console.log(life.state);
