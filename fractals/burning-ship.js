function lerp(a,b, t)
{
	return (b-a)*t+a;
}

function create_color_rgb(r,g,b)
{
	return {"r":r,"g":g,"b":b};
}

function Palette()
{
	this.palette = Array(256);
	var value = 0;
	var index = 0;
	var dt = Math.PI*8/256;
	for(var i = 0; i < 256; i++)
    {
		//~~ == float to int
		index = ( i + 512 - 512 * Math.exp(-i / 30) / 5);
		value = ~~index;
		this.palette[i] = //create_color_rgb(lerp(255, 255, i/255), lerp(255, 0, i/255), lerp(255, 0, i/255));
			create_color_rgb(Math.round(Math.sin(i) * 255), 
				Math.round(Math.sin(Math.cos(i) * 32) * 255),
				Math.round(Math.sin(i) * Math.cos(i) * 255));
    }
	this.palette[255] = 0;
}


function Burning_Ship()
{
	this.palette = new Palette();
}

Burning_Ship.prototype.size = 100;
Burning_Ship.prototype.range = 2;
Burning_Ship.prototype.max_iteration = 256;
Burning_Ship.prototype.mid_point = {x: 0, y: 0};

var first = 1;

Burning_Ship.prototype.generate = function (image)
{
	
	
	var dx, dy;
	var cx, cy;
	var px, py;
	var i, j, k;
	var tmpx, tmpy;
	var radius = 2.0 * this.range;
	var dist;
	var squarex, squarey;
	dx = 0; dy = 0;

	//предрассчёты - эти данные мы будем использовать для каждой строки
	var step = 1.0 / this.size;	
	var cx_row = new Array(this.size);
	dx = 0;
	for(j = 0; j < this.size; j++)
	{
		cx_row[j] = this.mid_point.x + radius * (dx - 0.5);
		dx += step;	
	}
	
	//Сканируем сверху вниз, i - строка, j - колонка в ней
	//образ квадратный, шаг перехода поэтому берём в 1/size
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
		
		//здесь мы соптимизировали - можно вынести из циклов 2 * radius
		cy = this.mid_point.y + radius * (dy - 0.5);
		dy += step;
		dx = 0;
		for(j = 0; j < this.size; j++)
		{
			cx = this.mid_point.x + radius * (dx - 0.5);
			dx += step;	
			//cx = cx_row[j];
			

			//проверяем уход в бесконечность
			px = 0;
			py = 0;
			squarex = 0;
			squarey = 0;
			
			//умножение компл.чисел 
			//(a + bi)*(c + di) = (a*c - b*d) + (b * c + a * d) * i
			//px * px - py * py
			//py * px + px * py ===> 2.0 * (px * py)
			for (k = 0; k < this.max_iteration; k++)
			{
				tmpx = squarex - squarey - cx;
				tmpy = 2.0 * Math.abs(px * py) - cy;
				
				px = tmpx; py = tmpy;
				dist = px * px + py * py;
				squarex = px * px;
				squarey = py * py;
				if (dist > 10.0)
				{
					break;
				}
			}


			function set_pixel(value, color)
			{
				var px = (j + (test.size - i) * test.size)*4;
				//var v = (1.0 - value / test.max_iteration);
				//var value = 255 - value;
				//var v = (value / test.max_iteration);
	
				var v = color;
				image.data[px] = v.r;
				image.data[px+1] = v.g;
				image.data[px+2] = v.b;
				image.data[px+3] = 255;
			}
			if (k > 255)
			{
				k = 255;
			}
			if (dist > 10)
			{
				dist = 10;
			}
			var color = this.palette.palette[k];
			if (dist < 10)
			{
				//color.b = k;
			}
			//color.r = k; color.g = k; 
			set_pixel(k, color);
		}
	}
	first = 0;
}

var test = new Burning_Ship();




//Задать параметры
test.size = 400;
test.range = 2;
//test.range = 1.74;
//test.midpoint = {x: 0.45, y: 0.5};

//Фактический предел точности 1e-15. 
//test.range = 1.7763568394002505e-15;
//test.mid_point = {x : 1.7068571069791179 , y : 4.0925438691378533e-16};

test.range = 0.125;

test.mid_point = {x : 1.6768750000000001 , y : 0.0037500000000001976 };

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

render_image();



$(canvas).on("click", function (event) {
	//позиция объекта в документе
	var x = $(this).offset().left;
	var y = $(this).offset().top;
	//координаты мыши в документе - позиция объекта в документе
	x = event.pageX - x;
	y = event.pageY - y;
	//console.log(x, y);	
	//масштабировать и зазначить
	x = x / test.size;
	//эта хрень перевёрнутая 
	y = 1.0 - y / test.size;
	x = (x - 0.5) * 2;
	y = (y - 0.5) * 2;
	test.mid_point.x += test.range * x;
	test.mid_point.y += test.range * y;
	//console.log(test.mid_point);
	render_image();
});


$("#zoom").on("click", function (event) {
	test.range *= 0.5;
	render_image();
});

$("#unzoom").on("click", function (event) {
	test.range /= 0.5;
	render_image();
});


 //Глубина : 9.5367431640625e-7
//Центр : x : 1.8542079019546507 , y : 6.628036496985138e-7 

