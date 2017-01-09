function getMessage(a, b) {

	var aType = typeof a;
	var bType = typeof b;

	if (aType == "boolean" && a === true) {
	  return ("Переданное GIF-изображение анимировано и содержит " + b + " кадров" );
	} else if (aType == "boolean" && a === false) {
	  return ('Переданное GIF-изображение не анимировано');
	}

	if (aType == "number") {
	   var attr = b*4;
	   return ("Переданное SVG-изображение содержит " + a + " объектов  " + attr + " аттрибутов");
	  }

    if (aType == "object" && a.length !== undefined) {
	     // var arr = a;
		 // var result = arr.reduce(function(sum, current) {
		 // return sum + current;
		 // }, 0);
           var sum = 0;
		   for (var i = 0; i < a.length - 1; i++) {
		   	sum = sum + a[i];
		   };
		 return ("Количество красных точек во всех строчках изображения: " + sum);
    }

    if ((aType == "object" && a.length !== undefined) && (bType  == "object" && b.length !== undefined)) {
    	
    	var square  = 0;
    	for (var i = 0; i < a.length -1; i++) {
    		square  = sguare + (b[i]*a[i])
    	}

    	//var arr3 = arr.map(function(value, index){ return value * arr2[index] });
    	//var square = arr3.reduce(function(sum, current) {
	    //return sum + current;
	    //}, 0);
        return ("Общая площадь артефактов сжатия: " + square + " пикселей")
    }
}



