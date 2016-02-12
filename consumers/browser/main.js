(function() {

  'use strict';

  let xhr = new XMLHttpRequest();

  xhr.addEventListener('load', (e) => {
    console.log(e);
  });

  xhr.open('GET', 'http://localhost:3000/api');
  xhr.send();

})();
