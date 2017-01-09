/**
 * @fileoverview
 * @author Бурнашов Андрей
 */

'use strict';

(function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Проверяем тип загружаемого файла.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */

   //Форма и поля для ввода
  var resizeForm = document.forms['upload-resize'];
  var left = resizeForm['resize-x'];
  var top = resizeForm['resize-y'];
  var side = resizeForm['resize-size'];
  //функция которая дизейблит кнопку submit при невалидных данных


  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  function setConstraintValues() {
    currentResizer.setConstraint(parseInt(left.value, 10), parseInt(top.value, 10), parseInt(side.value, 10));
  }

  left.addEventListener('change', setConstraintValues);

  top.addEventListener('change', setConstraintValues);

  side.addEventListener('change', setConstraintValues);

  resizeForm.addEventListener('change', setConstraintValues);

  function setConstraint() {
    left.value = currentResizer.getConstraint().x;
    top.value = currentResizer.getConstraint().y;
    side.value = currentResizer.getConstraint().side;
  }

  window.addEventListener('resizerchange', setConstraint);

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.addEventListener('change', function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);


        fileReader.addEventListener('load', function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();

          setTimeout(setConstraint, 100);
        });

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  });

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });




  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.addEventListener('submit', function(evt) {
    evt.preventDefault();


      filterImage.src = currentResizer.exportImage().src;
      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');

    if (docCookies.getItem('filter')) {
      filterImage.className = 'filter-image-preview ' + docCookies.getItem('filter');
      document.getElementById('upload-filter-' + docCookies.getItem('filter').substr(7)).checked = true;
    }
  });

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.addEventListener('submit', function(evt) {
    evt.preventDefault();
    //вычисление времени жизни куки
    var myBirthday = new Date(2016, 10, 8).getTime();
    var dateDiff = Date.now() - myBirthday;
    var cookieExpirationDate = Date.now() + dateDiff;

    //определяем выбранный фильтр
    var selectedFilter = document.getElementsByClassName('filter-image-preview')[0].className;
    var imageSrc = document.getElementsByClassName('filter-image-preview')[0].src;
    if (selectedFilter.includes('filter-none')) {
      var filterValue = 'filter-none';
    }
    if (selectedFilter.includes('filter-chrome')) {
      filterValue = 'filter-chrome';
    }
    if (selectedFilter.includes('filter-sepia')) {
      filterValue = 'filter-sepia';
    }
    ajax({
      url:"server.php",
      statbox:"status",
      method:"POST",
      data:
      {
        src:imageSrc,
        filter:filterValue
      },
      succes: location.reload()
    });
    //записываем выбранный фильтр в куки
    document.cookie = 'filter=' + filterValue + ';expires=' + cookieExpirationDate;

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.addEventListener('change', function() {
    if (!filterMap) {
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  });
  cleanupResizer();
  updateBackground();

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function XmlHttp()
  {
    var xmlhttp;
    try{xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");}
    catch(e)
    {
      try {xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");}
      catch (E) {xmlhttp = false;}
    }
    if (!xmlhttp && typeof XMLHttpRequest!='undefined')
    {
      xmlhttp = new XMLHttpRequest();
    }
    return xmlhttp;
  }

  function ajax(param)
  {
    if (window.XMLHttpRequest) var req = new XmlHttp();
    var method=(!param.method ? "POST" : param.method.toUpperCase());

    if(method=="GET")
    {
      var send=null;
      param.url=param.url+"&ajax=true";
    }
    else
    {
      send="";
      for (var i in param.data) send+= i+"="+param.data[i]+"&";
      send=send+"ajax=true";
    }

    req.open(method, param.url, true);
    // if(param.statbox)document.getElementById(param.statbox).innerHTML = '<img src="images/wait.gif">';
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.send(send);
    req.onreadystatechange = function()
    {
      if (req.readyState == 4 && req.status == 200) //если ответ положительный
      {
        if(param.success)param.success(req.responseText);
      }
    }
  }
  function base64_decode( data ) {	// Decodes data encoded with MIME base64
    // 
    // +   original by: Tyler Akins (http://rumkin.com)


    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i=0, enc='';

    do {  // unpack four hexets into three octets using index points in b64
      h1 = b64.indexOf(data.charAt(i++));
      h2 = b64.indexOf(data.charAt(i++));
      h3 = b64.indexOf(data.charAt(i++));
      h4 = b64.indexOf(data.charAt(i++));

      bits = h1<<18 | h2<<12 | h3<<6 | h4;

      o1 = bits>>16 & 0xff;
      o2 = bits>>8 & 0xff;
      o3 = bits & 0xff;

      if (h3 == 64)	  enc += String.fromCharCode(o1);
      else if (h4 == 64) enc += String.fromCharCode(o1, o2);
      else			   enc += String.fromCharCode(o1, o2, o3);
    } while (i < data.length);

    return enc;
  }

})();
