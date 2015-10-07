function Palette()
{
	this.palette = Array(256);
	var value = 0;
	var index = 0;
	for(var i = 0; i < 256; i++)
    {
		//~~ == float to int
		index = ( i + 512 - 512 * Math.exp(-i / 30) / 5);
		value = ~~index;
		//console.log(value, value.toString(16));
		value2 = ~~(index * 52);
		value3 = ~~(index * 124);
		this.palette[i] = { 
			r: value & parseInt("0000FF", 16),
			b: value & parseInt("0000FF", 16),
			g: value & parseInt("0000FF", 16)
		};
		//console.log(this.palette[i]);
    }
	this.palette[255] = 0;
}


var BigNumber = Decimal;

function Burning_Ship()
{
	this.palette = new Palette();
}

Burning_Ship.prototype.size = 100;
Burning_Ship.prototype.range = new BigNumber("2.0");

Burning_Ship.prototype.max_iteration = 256;
Burning_Ship.prototype.mid_point = {x: new BigNumber(0), y: new BigNumber(0)};


Burning_Ship.prototype.generate = function (image)
{
	
	
	var dx, dy;
	var cx, cy;
	var px, py;
	var i, j, k;
	var tmpx, tmpy;
	var squarex, squarey;

	var zero = new BigNumber(0);
	var half = new BigNumber(0.5);
	//здесь мы соптимизировали - можно вынести из циклов 2 * radius	
	var radius = this.range.times(2);


	//Сканируем сверху вниз, i - строка, j - колонка в ней
	//образ квадратный, шаг перехода поэтому берём в 1/size
	var step = 1.0 / this.size;
	dy = zero;

	//оптимизация - эти значения вычисляются каждый раз для каждой строки, 
	//а всего строчек this.size
	//значит одни и те же значения вычисляются this.size раз 
	var cx_row = new Array(this.size);
	dx = new BigNumber(0);
	for(j = 0; j < this.size; j++)
	{
		cx_row[j] = this.mid_point.x.plus(radius.times(dx.minus(0.5)));
		dx = dx.plus(step);
	}
	
	var atime, btime, maxtime;
	maxtime = 0;
	for(i = 0; i < this.size; i++)
	{
		//мы начинаем из точки mid_point, 
		//надо вычислить вектор, исходящий из неё в такую-то сторону 
		//поэтому берём 1/i, получается целое положительное в диапазоне от 0 до size
		//зазначиваем его с помощью (x - 0.5) * 2
		//получается число в диапазоне -1 < 1
		//таким обарзом получается вектор,исходящий из mid_point
		//с длиной 0 < sqrt(2 * radius^2)
		//уменьшая радиус, получаем более "глубокое" изображение - пока точности хватит
		//надо сделать выбор точки центра с помощью мышки...
		

		cy = this.mid_point.y.plus(radius.times(dy.minus(half)));
		dy = dy.plus(step);
		
		console.log("row number ", i);
		atime = new Date().getTime();
		for(j = 0; j < this.size; j++)
		{
			cx = cx_row[j];
			
			//проверяем уход в бесконечность
			px = zero;
			py = zero;
			
			//умножение компл.чисел
			//(a + bi)*(c + di) = (a*c - b*d) + (b * c + a * d) * i
			//px * px - py * py
			//py * px + px * py ===> 2.0 * (px * py)
			//внезапно мы вычисляем квадраты px, py в каждом цикле
			//сперва для вычисления длины, а затем для получения получения степени компл.числа
			//можно вычислить их один раз и перенести результат в следующую итерацию
			squarex = zero;
			squarey = zero;
			for (k = 0; k < this.max_iteration; k++)
			{
				tmpx = squarex.minus(squarey).minus(cx);
				tmpy = px.times(py).abs().times(2.0).minus(cy);
				
				//if (px.times(px).plus(py.times(py)).gt(10.0))
				squarex = tmpx.times(tmpx);
				squarey = tmpy.times(tmpy);
				if (squarex.plus(squarey).gt(10.0))
				{
					break;
				}
				//копируем ссылки на объекты, т.к. они будут пересозданы
				px = tmpx; py = tmpy;
			}


			function set_pixel(value, color)
			{
				var px = (j + (test.size - i) * test.size)*4;
				var v = (1.0 - value / test.max_iteration);
				v = 255 - value;
				image.data[px] = v;
				image.data[px+1] = v;
				image.data[px+2] = v;
				
				//v = color;
				//image.data[px] = v.r;
				//image.data[px+1] = v.g;
				//image.data[px+2] = v.b;
				image.data[px+3] = 255;
			}
			if (k > 255)
			{
				k = 255;
			}
			set_pixel(k, this.palette.palette[k]);
		}
		btime = new Date().getTime() - atime;
		if (btime > maxtime)
			maxtime = btime;
	}
	console.log(maxtime);
}



var test = new Burning_Ship();

//Задать параметры
test.size = 100;
//test.range = new BigNumber(2.0);
test.range = new BigNumber(1.74);
test.midpoint = {x: new BigNumber(0.45), y: new BigNumber(0.5)};

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

var image = context.createImageData(test.size, test.size);



function render_image()
{
	//сгенерировать картинку
	test.generate(image);
	context.putImageData(image, 0, 0); // at coords 0,0
	
	$("#deep").text(" "+test.range);
	$("#center").text("x : "+test.mid_point.x + " , y : " + test.mid_point.y);
}

//render_image();

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