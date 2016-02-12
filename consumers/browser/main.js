(function() {

  'use strict';

  const DOM = {
    btnGenerate: document.querySelector('.btn'),
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


  (function create() {
    xhr.open('GET', 'http://localhost:3000/api');
    xhr.send();
  })();

})();
