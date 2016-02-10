export default function life() {

  const _Rand = Math.random;
  const _Round = Math.round;
  
  const mappable = (len) => {
    let arr = [];
    for(let i = 0; i < len; i++) {
      arr.push(0);
    }
    return arr;
  };

  const populate = (acc, cur) => {
    return acc + String(_Round(_Rand()));
  };

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
