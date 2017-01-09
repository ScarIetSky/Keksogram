'use strict';

(function() {

 /**
  * @param {Object} data
  * @constractor
  */

  function Photo(data) {
    this._data = data;
  }

  Photo.prototype.render = function() {
    var pictureTemplate = document.querySelector('#picture-template');
    this.element = pictureTemplate.content.children[0].cloneNode(true);

    this.element.querySelector('.picture-comments').textContent = this._data.comments;
    this.element.querySelector('.picture-likes').textContent = this._data.likes;

    var image = new Image(182, 182);
      image.src = this._data.url;
      image.onload = function() {
      this.element.replaceChild(image, this.element.querySelector('img'));
      this.element.querySelector('img').classList.add(this._data.filter);


      }.bind(this);

    image.onerror = function() {
      this.element.classList.add('picture-load-failure');
    }.bind(this);
  };
    
    window.Photo = Photo;
})();
