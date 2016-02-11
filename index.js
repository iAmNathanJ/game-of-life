import express from 'express';
import gameOfLife from './bin/game-of-life.js';

const app = express();
const port = 3000;

app.get('/api', (req, res) => {
  let life = gameOfLife();
  life.seed(20, 10);
  res.json(life.state);
});

app.post('/api', (req, res) => {

});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
