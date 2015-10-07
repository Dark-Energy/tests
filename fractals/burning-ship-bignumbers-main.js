
var test = {};

//Задать параметры
test.size = 100;
//test.range = new BigNumber(2.0);
test.range = new BigNumber(1.74);
test.mid_point = {x: new BigNumber(0.45), y: new BigNumber(0.5)};

//Фактический предел точности 1e-15. 
//test.range = new BigNumber("1.7763568394002505e-15");
//test.mid_point = {x : new BigNumber("1.7068571069791179") , y : new BigNumber("4.0925438691378533e-16")};


//создание контекста, пиксельных данных и проч.
var canvas = document.getElementById("canvas");
if ( ! canvas )
	console.log("Error!");
var context = canvas.getContext("2d");
canvas.width = test.size;
canvas.height = test.size;	

var image = context.createImageData(test.size, 1);


var worker;

function render_image()
{

worker = new Worker(   "burning-ship-bignumbers-worker.js" );

worker.onmessage = function (event)
{
	if (event.data.end)
	{
		worker = undefined;
		$("#deep").text(" "+test.range);
		$("#center").text("x : "+test.mid_point.x + " , y : " + test.mid_point.y);
	}
	else
	{
		var row = event.data.row;
		var y = event.data.y;
		console.log("y = ", y);
		for(var i = 0; i < test.size; i++)
		{
			image.data[i*4] = row[i*4];
			image.data[i*4+1] = row[i*4+1];
			image.data[i*4+2] = row[i*4+2];
			image.data[i*4+3] = 255;//row[i+3];
		}
		
		//изображение перевёрнуто
		context.putImageData(image, 0, test.size-y); // at coords 0,0		
	}
	
}

	var test_object = {};
	test_object.size = test.size.toString();
	test_object.range = test.range.toString();
	test_object.mid_point_x = test.mid_point.x.toString();
	test_object.mid_point_y = test.mid_point.y.toString();
	worker.postMessage({"test_object": test_object});

	
}

render_image();

$(canvas).on("click", function (event) {
	//позиция объекта в документе
	var x = $(this).offset().left;
	var y = $(this).offset().top;
	//координаты мыши в документе - позиция объекта в документе
	x = event.pageX - x;
	y = event.pageY - y;

	//масштабировать и зазначить
	x = new BigNumber(x).div(test.size);
	//x = x / test.size;
	//изображение перевёрнуто 
	//y = 1.0 - y / test.size;
	y = new BigNumber("1.0").minus(new BigNumber(y).div(test.size));
	x = x.minus(0.5).times(2);
	y = y.minus(0.5).times(2);
	test.mid_point.x = test.mid_point.x.plus(test.range.times(x));
	test.mid_point.y = test.mid_point.y.plus(test.range.times(y));
	render_image();
});


$("#zoom").on("click", function (event) {
	test.range = test.range.times(0.5);
	render_image();
});

$("#unzoom").on("click", function (event) {
	test.range = test.range.div(0.5);
	render_image();
});