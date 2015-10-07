importScripts ("decimal.min.js", "burning-ship-bignumbers-def.js"); 
onmessage = function (event) 
{ 	
	var params = event.data.test_object; 
	var test = new Burning_Ship(); 
	
	test.size = parseInt(params.size); 
	test.range = new BigNumber(params.range); 	
	test.mid_point.x = new BigNumber(params.mid_point_x);
	test.mid_point.y = new BigNumber(params.mid_point_y);
	test.generate(function (row, y) { 
		self.postMessage({"row": row, "y": y}); 	
	}, 	
	function () { 		
		self.postMessage({"end":true}); 	
	} ); 
}