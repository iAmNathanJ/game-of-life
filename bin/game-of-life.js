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

const populate = (acc) => acc + String(_Round(_Rand()));
const getAdjacent = (row, col, state) => {
};


module.exports = function life() {

  // Array.prototype.grab = (index, def) => this[index] || def;

  return {

    state: [],

    seed(rows, cols) {
      this.state = mappable(rows).map(row => {
        return mappable(cols).reduce(populate, '');
      });
    },

    generate() {
      return this.state.map(row => {

      });
    }
  };

};
