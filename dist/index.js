'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var express = _interopDefault(require('express'));

var app = express();
var port = 3000;

app.get('/', function (req, res) {
  res.json({ stuff: [] });
});

app.listen(port, function () {
  console.log('Listening on http://localhost:' + port);
});