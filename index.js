'use strict';

const express = require('express');
const gameOfLife = require('./bin/game-of-life.js');
const app = express();
const port = 3000;


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8080');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/api', (req, res) => {
  let life = gameOfLife();
  life.seed(20, 10);
  res.json(life.state);
});

app.get('/*', (req, res) => {
  res.redirect('/api');
});

app.post('/api', (req, res) => {
  console.log(req);
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
