'use strict';

// window.$_life = require('./src/game-of-life');

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

let life = require('./src/game-of-life')({
  limitX: 5, limitY: 6
});

life.seed([

]);

(function go() {

  // console.log(life.state);
  life.generate();

  setTimeout(_ => {
    go();
  }, 400);

})();
