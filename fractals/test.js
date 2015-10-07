function factorial(n, stop)
{
	var	o = math.bignumber(1);
	n = math.bignumber(n);
	stop = math.bignumber(stop);
	while (n.gt(stop))
	{
		o = o.times(n);
		n = n.minus(1);
	}
	return o;
}

function choose(n, k)
{
	return factorial(n, k).div(factorial(n - k, 0));
}

function test_speed()
{
	var a = new Date().getTime();
	var t = choose(50000, 50)
	var b = new Date().getTime();
	console.log(b - a);
	console.log(t.toString());
}

test_speed();