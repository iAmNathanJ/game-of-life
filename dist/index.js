'use strict';

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

var express = _interopDefault(require('express'));

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.json({ stuff: [] });
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${ port }`);
});
