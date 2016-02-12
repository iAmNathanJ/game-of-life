'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const gameOfLife = require('./bin/game-of-life.js');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8080');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/api', (req, res) => {
  let life = gameOfLife();
  life.seed(8, 8);
  res.json(life.state);
});

app.get('/*', (req, res) => {
  res.redirect('/api');
});

app.post('/api', (req, res) => {
  let life = gameOfLife()
    , nextGen;

  life.state = JSON.parse(req.body.json);
  nextGen = life.generate();

  res.json(nextGen);
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
