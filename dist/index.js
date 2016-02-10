'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var express = _interopDefault(require('express'));

function life() {

  var _Rand = Math.random;
  var _Round = Math.round;

  var mappable = function mappable(len) {
    var arr = [];
    for (var i = 0; i < len; i++) {
      arr.push(0);
    }
    return arr;
  };

  var populate = function populate(acc, cur) {
    return acc + String(_Round(_Rand()));
  };

  return {

    state: [],

    seed: function seed(rows, cols) {
      this.state = mappable(rows).map(function (row) {
        return mappable(cols).reduce(populate, '');
      });
    },
    generate: function generate() {
      return this.state.map(function (row) {});
    }
  };
};

var app = express();
var port = 3000;

app.get('/', function (req, res) {
  var life$$ = life();
  life$$.seed(20, 10);
  res.json(life$$.state);
});

app.listen(port, function () {
  console.log('Listening on http://localhost:' + port);
});