'use strict';

const test = require('tape');
const life = require('../lib/game-of-life.js');

test('Life is a thing.', t => {
  t.ok(life, 'it lives');
  t.end();
});
