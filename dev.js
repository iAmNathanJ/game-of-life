'use strict';

const watch = require('chokidar').watch;
const spawn = require('child_process').spawn;

const tasks = {
  build: 'npm run build',
  serve: 'live-server ../'
};

const files = [
  './lib/*.js',
  './index.js'
];

function run(task) {
  let args = tasks[task].split(' ');
  let cmd = args.shift();
  spawn(cmd, args, { stdio: 'inherit' });
}

watch(files, {
  persistent: true
})
.on('change', path => {
  run('build');
});

run('serve');
