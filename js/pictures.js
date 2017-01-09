'use strict';

$(function() {
  var filters = document.querySelector('.filters');
  var pictureBlock = document.querySelector('.pictures');
  var loadedPictures = null;
  var scrollInterval;
  var currentPage = 0;
  var PAGE_SIZE = 12;

  filters.classList.remove('hidden');

  for (var i = 0; i < filters.length; i++) {
    filters[i].onclick = function(evt) {
      var clickedElementId = evt.target.id;
      setActiveFilter(clickedElementId);
    };
  }

  getPictures();

  clearInterval(scrollInterval);
  scrollInterval = setInterval(addPageToScroll, 100);

  window.addEventListener('scroll', function() {
    addPageToScroll();
  });

  function addPageToScroll() {
    var picturesCoord = document.querySelector('.pictures').getBoundingClientRect();
    if (loadedPictures !== null && picturesCoord.bottom - 50 <= window.innerHeight) {
      renderPictures(loadedPictures, ++currentPage);
    }
  }

  function getPictures() {
    document.querySelector('.pictures').classList.add('pictures-loading');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/pictures.json');
    xhr.timeout = 1000;
    xhr.onload = function(evt) {
      var data = evt.target.response;
      loadedPictures = JSON.parse(data);
      pictureBlock.classList.remove('pictures-loading');
      setActiveFilter('filter-popular');
    };

    xhr.onerror = function() {
      pictureBlock.classList.remove('pictures-loading');
      pictureBlock.classList.add('pictures-failure');
    };

    xhr.send();
  }

  function renderPictures(pictures, pageNumber, replace) {
    if (replace) {
      pictureBlock.innerHTML = '';
    }
    var from = pageNumber * PAGE_SIZE;
    var to = from + PAGE_SIZE;
    var pagePictures = pictures.slice(from, to);
    pagePictures.forEach(function(picture) {
      var photoElement = new Photo(picture);
      photoElement.render();
      pictureBlock.appendChild(photoElement.element);
    });
    
  }
  

  function setActiveFilter(id) {
    switch (id) {
      case 'filter-popular':
        loadedPictures.sort(function(a, b) {
          return b.likes - a.likes;
        });
        break;
      case 'filter-new':
        loadedPictures.sort(function(a, b) {
          a = new Date(a.date);
          b = new Date(b.date);
          return b - a;
        });
        break;
      case 'filter-discussed':
        loadedPictures.sort(function(a, b) {
          return b.comments - a.comments;
        });
        break;
    }
    currentPage = 0;
    renderPictures(loadedPictures, currentPage, true);
  }
});
