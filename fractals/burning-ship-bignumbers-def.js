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
Burning_Ship.prototype.zero = new BigNumber(0);


Burning_Ship.prototype.generate = function (row, end)
{
	
	
	var dx, dy;
	var cx, cy;
	var px, py;
	var i, j, k;
	var tmpx, tmpy;
	var squarex, squarey;

	var zero = this.zero;
	var half = new BigNumber(0.5);
	//здесь мы соптимизировали - можно вынести из циклов 2 * radius	
	var radius = this.range.times(2);


	//Сканируем сверху вниз, i - строка, j - колонка в ней
	//образ квадратный, шаг перехода поэтому берём в 1/size
	var step = 1.0 / this.size;
	dy = zero;

	var row_value = new Array(this.size*4);
	
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
		cy = this.mid_point.y.plus(radius.times(dy.minus(half)));
		dy = dy.plus(step);
		
		for(j = 0; j < this.size; j++)
		{
			cx = cx_row[j];
			
			//проверяем уход в бесконечность
			px = zero;
			py = zero;
			
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
				var px = j * 4;
				
				var v = (1.0 - value / this.max_iteration);
				v = 255 - value;

				row_value[px] = v;
				row_value[px+1] = v;
				row_value[px+2] = v;
				
				row_value[px+3] = 255;
			}
			if (k > 255)
			{
				k = 255;
			}
			set_pixel.call(this, k, this.palette.palette[k]);
		}
		if (row)
		{
			row(row_value, i);
			//console.log("end row ", i);
		}
	}
	if (end)
	{
		end();
	}
}
