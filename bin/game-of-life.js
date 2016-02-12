'use strict';

const _Rand = Math.random;
const _Round = Math.round;

const mappable = (len) => {
  let arr = [];
  for(let i = 0; i < len; i++) {
    arr.push(0);
  }
  return arr;
};

const grab = (arr, i, j) => {
  if(!arr[i]) return 0;
  return arr[i][j] || 0;
}

const populate = (acc) => acc + String(_Round(_Rand()));

const liveOrDie = (row, cell, state) => {

  let thisCellIsAlive = grab(state, row, cell);

  let neighbors = [
    grab(state, row-1, cell-1),
    grab(state, row-1, cell+1),
    grab(state, row+1, cell-1),
    grab(state, row+1, cell+1),
    grab(state, row-1, cell),
    grab(state, row+1, cell),
    grab(state, row, cell+1),
    grab(state, row, cell-1)
  ];

  let liveNeighbors = neighbors.reduce((total, cell) => {
    return total + parseInt(cell);
  }, 0);

  if(thisCellIsAlive) {
    return (liveNeighbors > 1 && liveNeighbors < 4) ? 1 : 0;
  } else {
    return (liveNeighbors === 3) ? 1 : 0;
  }
};


module.exports = function life() {

  return {

    state: [],

    seed(rows, cols) {
      this.state = mappable(rows).map(row => {
        return mappable(cols).reduce(populate, '');
      });
    },

    generate() {
      return this.state.map((row, rowNum) => {
        return row.split('').map((cell, cellNum) => {
          return liveOrDie(rowNum, cellNum, this.state);
        }).join('');
      });
    }
  };

};
