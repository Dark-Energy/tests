/*
Utils functions

trim, forEach, every

*/

function get_first_key(obj)
{
	for(var key in obj) {
		if (obj.hasOwnProperty(key)) {
			return key;
		}
	}
}

function get_first_key_secure(obj)
{
	for(var key in obj) {
		if (obj.hasOwnProperty(key)) {
			//delete operator doesnt delete key from object		
			if (typeof obj[key] !== 'undefined') {
				return key;
			}
		}
	}
}

function find_all_by_field_value(arr, field, value)
{
	var result = new Array();
	for(var i = 0; i < arr.length; i++){
		var tg = arr[i][field];
		if (value === tg){
			result.push(arr[i]);
		}
	}
	return result;
}



function find_by_field_value(arr, field, value)
{
	for(var i = 0; i < arr.length; i++)	{
		var tg = arr[i][field];
		if (value === tg){
			return arr[i];
		}
	}
	return null;
}


function remove_by_field_value(arr, field, value)
{
	for(var i = 0; i < arr.length; i++)	{
		var tg = arr[i][field];
		if (value === tg){
			var r = arr[i];
			arr.splice(i, 1);
			return r;
		}
	}
	return null;
}


function remove_all_by_field_value(arr, field, value)
{
	var i = 0; 
	while (i < arr.length) {
		var tg = arr[i][field];
		if (value === tg){
			arr.splice(i, 1);
		}
		else {
			i++;
		}
	}
	return null;
}


function dictionary_to_array(shit, key_field_name, value_field_name)
{
	if (!key_field_name) {
		key_field_name = "key";
	}
	if (!value_field_name) {
		value_field_name = "value";
	}
	var r = new Array();
	var item = {};
	for(var k in shit) {
		if (shit.hasOwnProperty(k)) {
			item = {};
			item[key_field_name] = k;
			item[value_field_name] = shit[k];
			r.push( item );
		}
	}
	return r;
}

function create_url()
{
	var r = "";
	for(var i= 0; i < arguments.length; i++) {
		if (typeof arguments[i] !== 'undefined') {
			if (i > 0) {
				r += "/";
			}
			r += encodeURIComponent(arguments[i]);
		}
	}
	return r;
}


if (!String.prototype.trim) {
  (function() {
    // Вырезаем BOM и неразрывный пробел
    String.prototype.trim = function() {
      return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
  })();
}
