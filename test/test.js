'use strict';

const test = require('tape');
const life = require('../lib/game-of-life.js');

test('life is a thing', t => {
  t.ok(life, 'it lives');
  t.end();
});

test('life generates life', t => {

  life.seed([
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 }
  ]);

  life.generate();

  let expected = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 }
  ];

  t.deepEqual(life.state, expected, 'it generates');
  t.end();
});
