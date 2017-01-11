/*
Router
*/

function My_Router() 
{
	this.routes = new Array();
}


My_Router.prototype.decode_params = function (arr) 
{
	for(var i = 0; i < arr.length; i++) {
		arr[i] = decodeURIComponent(arr[i]);
	}
}

My_Router.prototype.test_hash = function (url)
{
	var item, groups;
	for(var i = 0; i < this.routes.length; i++) {
		item = this.routes[i];
		item.re.lastIndex = 0;		
		groups = item.re.exec(url);
		if (groups) {
			//remove whole match, left only parenthess groups
			if (groups.length > 1) {
				groups.splice(0,1);
			}
			
			this.decode_params(groups);
			
			item.callback.apply(item.obj, groups);
			
			return true;
		}
	}
	
	//if nothing match
	if (this.default_route) {
		this.default_route.callback.apply(this.default_route.obj, [url]);
	}
}

My_Router.prototype.add_default = function (callback, obj) 
{
	this.default_route = {callback: callback, obj: obj};
}

My_Router.prototype._add = function (re, callback, obj)
{
	return this.routes.push({re: re, callback: callback, obj: obj});
}


/*
	lead/:category/:page transform to regexp lead/([^/]+?)/([^/])+?
	without leading '#'!!!
*/
My_Router.prototype.add_route = function (route, callback, obj) 
{
	var frag = route.split("/");
	
	var t = "^";
	var str;

	for(var i = 0; i < frag.length; i++) {
		str = frag[i];
		if (!str || i > 0) {
			t +="/";
		}
		if (str) {
			if (str[0] === ":") {
				t += "([^/]+?)"
			}
			else {
				t += str;
			}
		}
	}
	t += "$";
	this._add(new RegExp(t), callback, obj);
}

My_Router.prototype.hash_change = function (e)
{
	var hash = window.location.hash;
	if (hash) {
		hash = hash.split("#");
		if (hash.length > 1) {
			hash = hash[1];
		}
		if (hash && hash[0] == "/") {
			hash = hash.slice(1);
		}
	}
	this.test_hash(hash);
}

My_Router.prototype.refresh = function ()
{
	this.hash_change();
}

//by default call route callback without change location
My_Router.prototype.navigate = function (hash, change_location)
{
	if (change_location) {
		var new_hash = "#"+hash;
		if (window.location.hash == new_hash) {
			this.test_hash(hash);
		}
		else {
			window.location.hash = new_hash;
		}
	}
	else {
		this.test_hash(hash);
	}
}

My_Router.prototype.start = function (force_hash_change)
{
	var self = this;
	window.addEventListener("hashchange", function (e) 
	{
		self.hash_change(e);
	}, false);
	
	if (force_hash_change) {
		this.hash_change();
	}
}

