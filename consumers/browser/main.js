(function() {

  'use strict';

  const DOM = {
    btnGenerate: document.querySelector('.btn.generate'),
    btnStart: document.querySelector('.btn.start'),
    btnStop: document.querySelector('.btn.stop'),
    main: document.querySelector('.app')
  };

  let xhr = new XMLHttpRequest()
    , currentState;

  function getNextGen(state) {
    xhr.open('POST', 'http://localhost:3000/api');
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(`json=${state}`);
  }

  function updateDom(state) {
    let div = document.createElement('div')
      , text = '';

    DOM.main.innerHTML = '';
    JSON.parse(state).forEach((row) => {
      text += `${row}<br />`;
    });
    div.innerHTML = text;
    DOM.main.appendChild(div);
  }

  xhr.addEventListener('load', (e) => {
    currentState = e.target.responseText;
    updateDom(currentState);
  });

  DOM.btnGenerate.addEventListener('click', (e) => {
    getNextGen(currentState);
  });

  DOM.btnPlay.addEventListener('click', (e) => {

    getNextGen(currentState);

    e.target.style.display = 'none';
    DOM.btnStop.style.display = 'block';

    let go = setInterval(() => {
      getNextGen(currentState);
    }, 1000);

    DOM.btnStop.addEventListener('click', (e) => {
      clearInterval(go);
      e.target.style.display = 'none';
      DOM.btnStart.style.display = 'block';
    });
  });


  function create() {
    xhr.open('GET', 'http://localhost:3000/api');
    xhr.send();
  };

  create();

})();
