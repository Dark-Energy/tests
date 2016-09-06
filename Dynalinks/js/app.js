/*
Utils functions

//trim, forEach, every
*/

if (!String.prototype.trim) {
  (function() {
    // Вырезаем BOM и неразрывный пробел
    String.prototype.trim = function() {
      return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
  })();
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

/*

*/

Dynalinks.Utils = {};

Dynalinks.Utils.create_id = function ()
{
	return Math.random().toString(36).substr(2, 9) + Date.now().toString();
}

Dynalinks.Utils.check_item = function (item)
{
	if (! item._id) {
		item._id = Dynalinks.Utils.create_id();
	}
	if (item.favorite && !item.favorite_text) {
		item.favorite_text = item.text;
	}
	if (!item.favorite && item.favorite_text) {
		item.favorite = true;
	}
}

Dynalinks.Utils.check_database = function (data)
{
	for(var cat in data) {
		arr = data[cat];
		for(var i =0; i < arr.length; i++) {
			Dynalinks.Utils.check_item(arr[i]);
		}
	}
}


function Dynalinks(data, display)
{
	this.database = data.database;
	//Dynalinks.Utils.check_database(data.database);
	this.names = data.names;
	this.categories = {};
	this.display = display;
	
	//this.initialize();
}

Dynalinks.prototype.create_url = function(category, tag)
{
	var a = Array.prototype.slice.call(arguments, 0);
	a.unshift("view");
	return create_url.apply(this, a);
}

Dynalinks.prototype.Database_Name = "database.txt";

/*
	CONTEXT
*/
Dynalinks.Context = function (data, category)
{
	this.category_name = category;
	this.pages = {};
	this.favorites = new Array();
	//this.tags = new Array();
	this.tags = ko.observableArray();
	this.hash = {};
	
	var item, tag;
	for(var i = 0; i < data.length; i++)
	{
		item = data[i];
		//#check integrity
		//Dynalinks.Utils.check_item(item);
		this.hash[item._id] = item;
		
		tag = item["tag"];
		
		if (!this.pages[tag])
		{
			this.pages[tag] = new Array();
			this.tags.push(tag);
		}
		this.pages[tag].push(item);
		if (item.favorite) {
			this.favorites.push(item);
		}
	}
	
	this.favorites = ko.observableArray(this.favorites);
}


Dynalinks.Context.prototype.move_item = function (item, new_tag)
{
	var page = this.get_page(item.tag);
	var new_page = this.get_page(new_tag);
	new_page.push(item);
	item.tag = new_tag;
	remove_by_field_value(page, '_id', item._id);
}

Dynalinks.Context.prototype.change_favorite = function(item, favorite, favorite_text)
{
	//remove or add to favorites
	if (!!(item.favorite) !== !!(favorite)) {
		if (item.favorite) {
			this.favorites.remove( function (i) { return i._id === item._id; } );
			delete item.favorite_text;
			return;
		}
		else {
			this.favorites.push( item );
		}
		item.favorite = favorite;
	}
	if (item.favorite && item.favorite_text !== favorite_text) 	{
		if (!favorite_text) {
			item.favorite_text = item.text;
		}
		else {
			item.favorite_text = favorite_text;
		}
	}
	this.favorites.valueHasMutated();
}

//create new page if doen't exists
Dynalinks.Context.prototype.get_page = function (tag)
{
	var page = this.pages[tag];
	if (!page) {
		this.pages[tag] = page = new Array();
		this.tags.push(tag);
	}
	return page;
} 

Dynalinks.Context.prototype.remove_page = function (tag)
{
	//remove page from page list
	var page = this.pages[tag];
	delete this.pages[tag];
	if (!page) return;
	
	//remove items from hash
	for(var i = 0; i < page.length; i++) {
		delete this.hash[page._id];
	}
	
	//remove page tag from tag list
	this.tags.remove(function (i) { return i === tag;});
	
	//clean favorite list
	this.favorites.remove( function (i) {return i.tag === tag;});
}

//1) add to page; 2) add to favorites, if marked; 3) add to hash
Dynalinks.Context.prototype.add_item = function (item)
{
	Dynalinks.Utils.check_item(item);
	
	if (this.hash[item._id]) {
		return;
	}
	var page = this.get_page(item.tag);
	page.push(item);
	if (item.favorite) {
		this.favorites.push(item);
	}
	this.hash[item._id] = item;
}

Dynalinks.Context.prototype.remove_item = function (item)
{
	//remove from hash
	if (!this.hash[item._id]){
		return;
	}
	
	//remove from favorite list
	if (item.favorite) {
		this.favorites.remove( function (i) {return i._id === item._id;});
	}
	
	//remove from page 
	var page = this.get_page(item.tag);
	remove_by_field_value(page, '_id', item._id);
	
	//remove from hash
	delete this.hash[item._id];
}

/*
CONTEXT MANAGEMENT
*/
Dynalinks.prototype.create_context = function (category)
{
	var links = this.database[category];
	if (!links) {
		console.log("error! Not found category ", category);
		return null;
	}
	var context = new Dynalinks.Context(links, category);	
	
	return context;
}

Dynalinks.prototype.get_category_context = function(category, force)
{
	var context = this.categories[category];
	if (!context || force) {
		this.categories[category] = context = this.create_context(category);
	}
	return context;
}

Dynalinks.prototype.get_active_context = function ()
{
	return this.get_category_context(this.current_category);
}

function check_key(obj, key)
{
	for(var k in obj) {
		if (k === key) {
			return true;
		}
	}
	return false;
}

Dynalinks.prototype.show_category = function (name)
{
	if (!name || !this.names[name]) {
		console.log("Category " + name + " not found");
		name = get_first_key(this.names);
		if (!name) {
			return;
		}
	}
	console.log("show category");
	var context = this.get_category_context(name);
	this.context = context;
	this.current_category = name;	
	
	//render page menu
	var page_menu = document.getElementById("page-menu");
	ko.cleanNode(page_menu);
	page_menu.innerHTML = "";
	ko.applyBindings(context, page_menu);
	
	//render favorites
	var favorites = document.getElementById("favorites-menu");
	ko.cleanNode(favorites);
	favorites.innerHTML = '';
	ko.applyBindings(context, favorites);
	
}

Dynalinks.prototype.get_page_template = function ()
{
	return this.templates[this.display_mode];
}

Dynalinks.prototype.show_page = function (name)
{
	this.context = this.get_active_context();
	//empty data
	if (!this.context) {
		return;
	}
	if (!name || !this.context.pages[name]) {
		var old_name = name;
		name = get_first_key_secure(this.context.pages);
		console.log("page " + old_name + " not found, show page "+name);
		if (!name) {
			console.log("category is empty, there are not page for show they");
		}
	}
	this.context.current_tag = name;
	this.context.display = this.display;
	var page = document.getElementById("page-content");
	ko.cleanNode(page);
	page.innerHTML = '';
	ko.applyBindings(this.context, page);
}

Dynalinks.prototype.show_category_menu = function ()
{
	this.category_menu = ko.observableArray(dictionary_to_array(this.names, "hash", "text"));
	ko.applyBindings(this, document.getElementById("category-menu"));
}


Dynalinks.prototype.initialize = function ()
{
	this.show_category_menu();
}

//category should exits
Dynalinks.prototype.add_link_to_category = function (item, category)
{
	//first add to database
	if (!this.database[category]) {
		console.log("Error! This category doesn't exits!", category);
	}
	/*
	//we must push the item in context and database
	//first push it to the context
	//second push it to the database
	*/
	this.database[category].push(item);	
	var context = this.get_category_context(category);
	context.add_item(item);
}


Dynalinks.prototype.remove_by_id = function (id)
{
	var item = remove_by_field_value(this.database[this.context.category_name], '_id', id);
	this.context.remove_item(item);	
	this.show_page(item.tag);
}

Dynalinks.prototype.add_category = function (name)
{
	if (this.database[name]) {
		alert("Категория с таким названием уже существует!");
		return;
	}
	if (!name)  {
		alert("Имя новой категории не задано!");
		return;
	}
	this.database[name] = new Array();
	this.names[name] = name;
	this.category_menu.push({hash:name, text: name});
}

Dynalinks.prototype.remove_tag = function (category, tag)
{
	remove_all_by_field_value(this.database[category], "tag", tag);
	
	var context = this.get_category_context(category);
	context.remove_page(tag);
}

Dynalinks.prototype.move_tag = function (tag, old_category, new_category)
{
	if (old_category === new_category) {
		return;
	}
	//1. update database
	if (!this.names[new_category]) {
		this.add_category(new_category);
	}
	var src = this.database[old_category];
	var dest = this.database[new_category];
	var i = 0;
	while( i < src.length) {
		if (src[i].tag === tag) {
			dest.push(src[i]);
			src.splice(i, 1);
		}
		else {
			i++;
		}
	}
	//2. update viewmodel, we just destroy existed contexts and create they again, too poor
	var old_context = this.get_category_context(old_category, true);	
	var new_context = this.get_category_context(new_category, true);
	//this.context = new_context;
	
	//if this tag exists, then need join it with moving tag
	//logic behind removing and inserting too complexity
	//new_context.insert_page(tag, old_context.pages[tag]);
	//old_context.remove_page(tag);
	
}


Dynalinks.prototype.save_data_to_file = function(filename, data, varname)
{
	var text = JSON.stringify(data, null, " ");
	text = "var " + varname + " = " + text + ";\n";
	var blob = new Blob([text], {type: "text/plain;charset=utf-8"});	
	saveAs(blob, filename); 
}

Dynalinks.prototype.save_to_file = function (filename)
{
	var db = {database: this.database, names: this.names};
	this.save_data_to_file(filename || this.Database_Name, db, "my_links");
}

Dynalinks.prototype.get_from_active_context = function(_id)
{
	return find_by_field_value(this.database[this.context.category_name], '_id', _id);
}

Dynalinks.prototype.update_item = function(old, new_value)
{
	//check favorite status
	if (old.favorite !== new_value.favorite) {
		this.context.change_favorite(old, new_value.favorite, new_value.favorite_text);
	}
	
	for(var key in new_value) {
		if (key !== 'new_tag' && key !== 'tag' && 
			Object.prototype.hasOwnProperty.call(old, key)) {
			old[key] = new_value[key]
		}
	}
	
	
	//check tag changes
	if (old.tag !== new_value.tag || new_value.new_tag) {
		this.context.move_item(old, new_value.new_tag || new_value.tag);
	}
	return {"category": this.context.category_name, "tag": old.tag};
	
}

Dynalinks.prototype.export_category = function (name)
{
	this.save_data_to_file(name + ".txt", this.database[name], "my_cat");
}



Dynalinks.prototype.export_tag = function (category, tag)
{
	var context = this.get_category_context(category);
	var data = context.pages[tag];
	this.save_data_to_file(tag + ".txt", data, "my_page");
}


Dynalinks.prototype.remove_category = function (name)
{
	if (this.database[name]) {
		delete this.database[name];
	}
	if (this.categories[name]) {
		delete this.categories[name];
	}
	if (this.names[name]) {
		delete this.names[name];
	}
	this.category_menu.remove( function (i) { return i.hash === name; });
}

Dynalinks.prototype.search = function (fields, value)
{
	var cat;
	var result = new Array;
	var name;
	for(var key in this.names) {
		if (!Object.prototype.hasOwnProperty.call(this.names, key)) {
			continue;
		}
		name = key;
		cat = this.database[name];
		cat.forEach( function (item) {
			
			fields.every( function (field) { 
				if (item[field].search(value) !== -1) {
					result.push( {"item": item, "cat": name});
					return false;
				}
				return true;
			});
		});
	}
	return result;
}

/*
APPLICATION
*/

var mr;

function Application(database)
{
	this.database = database;
	var self = this;
	document.addEventListener("DOMContentLoaded", function(event) { 
		if (self.Initialize()) {
			self.Initialize();
		}
	});
}

Application.prototype.remove_item = function(id)
{
	var self = this;
	var params = 
	{
		'type': 'label', 
		value: 'Правда удалить?', 
		handler: function (value) 
		{
			self.dynalinks.remove_by_id(id);
		}
	};
	var form = new PopupForm(params);
	form.show();
}

Application.prototype.move_tag = function ()
{
	var params = {}
	params.title = "Перенести страницу в другую категорию";
	params.type = "custom";
	params.dict = dynalinks.names;
	params.fields = [
		{"type": "select", 
		"dict":dynalinks.names,
		"data-value": "category"
		},
		{"type":"text",
		"data-value": "new_category"
		}
	];
	var self = this;
	params.handler = function (value) {
		var tag = self.dynalinks.context.current_tag;
		var source_category = self.dynalinks.context.category_name;
		var new_category = value.new_category || value.category;
		self.dynalinks.move_tag(
			tag, 
			source_category, 
			new_category);
		//3. reshow page
		mr.navigate( self.dynalinks.create_url(new_category,tag), true);

	}
	var form = new PopupForm(params);
	form.show();
}

//show form and add link to database
Application.prototype.add_item = function ()
{
	var params = {};
	params.type = "custom";
	var foo = document.createElement("div");
	var context = {};
	context.tags = this.dynalinks.context.tags;
	context.value = [this.dynalinks.context.current_tag];
	ko.renderTemplate("create-item-template", context, {}, foo);
	params.form = foo;
	
	var self = this;
	params.handler = function (value) {
		if (value.new_tag) {
			value.tag = value.new_tag;
			delete value.new_tag;
		}
		var category = self.dynalinks.context.category_name;
		var tag = value.tag;
		self.dynalinks.add_link_to_category(value, category);	
		mr.navigate(self.dynalinks.create_url(category, tag), true);
	}
	
	var form = new PopupForm(params);
	form.show();
}


Application.prototype.edit_item = function (id)
{
	var item = this.dynalinks.get_from_active_context(id);
	var params = {
		'type': 'custom'
	};
	
	//create edit form
	var foo = document.createElement("div");
	var context = {};
	context.tags = this.dynalinks.context.tags;
	context.item = item;
	ko.renderTemplate("edit-item-template", context, {}, foo);
	params.form = foo;	

	var self = this;
	params.handler = function (value) 
	{
		var result = self.dynalinks.update_item(item, value);
		mr.navigate(self.dynalinks.create_url(result.category, result.tag), true);			
	}
	var form = new PopupForm(params);
	form.show();
	
}

Application.prototype.turn_edit = function ()
{
	if (this.dynalinks.display.mode === "page_view") {
		this.dynalinks.display.mode = "page_edit";
	}
	else {
		this.dynalinks.display.mode = "page_view";
	}
	this.dynalinks.show_page(this.dynalinks.context.current_tag);
}

Application.prototype.export_category = function ()
{
	this.dynalinks.export_category(this.dynalinks.context.category_name);
}

Application.prototype.export_tag = function ()
{
	this.dynalinks.export_tag(this.dynalinks.context.category_name, 
		this.dynalinks.context.current_tag);
}

Application.prototype.remove_category = function ()
{
	var params = {
		"type": "label",
		"value": "Правда удалить эту категорию?"
	};
	var self = this;
	params.handler = function (value) {
		self.dynalinks.remove_category(self.dynalinks.context.category_name);
		mr.navigate(self.dynalinks.create_url(get_first_key(self.dynalinks.names)), true);
	}
	var form = new PopupForm(params);
	form.show();
}

Application.prototype.remove_tag = function ()
{
	var params = {
		"type": "label",
		"value": "Правда удалить эту страницу?"
	};
	var self = this;
	params.handler = function (value) {
		self.dynalinks.remove_tag(
			self.dynalinks.context.category_name, 
			self.dynalinks.context.current_tag
			);
		mr.navigate(this.dynalinks.create_url(self.dynalinks.context.category_name), true);
	}
	var form = new PopupForm(params);
	form.show();
}

Application.prototype.create_category = function ()
{
	var params = {};
	params.type = "text";
	params.title = "Название новой папки";
	var self  = this;
	params.handler = function (value) {
		self.dynalinks.add_category(value);
		mr.navigate(self.dynalinks.create_url(value), true);
	}
	var form = new PopupForm(params);
	form.show();
}

Application.prototype.move_item = function ()
{
	
}


Application.prototype.search = function (text)
{
	var value = text.trim();
	if (!value) {
		return;
	}
	mr.navigate(create_url("search", value), true);
}
	
Application.prototype.show_search_results = function (value)
{
	var results = this.dynalinks.search(["text", "href"], value);	

	var context = 
	{
		results:results
	};
	var view = document.getElementById("page-content");
	ko.cleanNode(view);
	view.innerHTML = '';
	
	ko.renderTemplate("template-search-result", context, {}, view);	
}

Application.prototype.init_router = function()
{
	mr = new My_Router();
	mr.add_route("view/:category/:page", 
	function (category, page) {
		if (this.current_category 
		&& this.current_category === category) {
			this.show_page(page);
		}
		else {
			this.show_category(category);
			this.show_page(page);
		}
	}, this.dynalinks);
		
	mr.add_route("view/:category", function (category) {
		this.show_category(category);		
		this.show_page(null);
	}, this.dynalinks);
	
	mr.add_default(function () {
		this.show_category(null);
		this.show_page(null);
	}, this.dynalinks);
	
	mr.add_route("search/:value", function (value) {
		this.show_search_results(decodeURIComponent(value));
	}, this);
	
	mr.start(true);	
}




var dynalinks;

Application.prototype.Initialize = function ()
{
	var self = this;
	

	//hack, get database name for 'save' function
	var tmp = window.location.href.split('#')[0].split('/');
	tmp = tmp[tmp.length-1].split('.');
	this.Save_Filename = tmp[0]  + ".txt";
	

	var display = {};
	this.display = display;
	display.mode = 'page_view';
	display.templates = {};
	display.templates['page_edit'] = 'template-page-content-edit'
	display.templates['page_view'] = 'template-page-content';
	
	dynalinks = this.dynalinks = new Dynalinks(this.database, display);

	ko.bindingHandlers.livelink =  {
		init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			var fragments = ko.unwrap(valueAccessor());
			var cat = bindingContext.$parent.category_name;
			element.href = '#'+self.dynalinks.create_url(cat, fragments);
		},
		update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			var fragments = ko.unwrap(valueAccessor());
			var cat = bindingContext.$parent.category_name;			
			element.href = '#'+self.dynalinks.create_url(cat, fragments);
		}
	};

	this.init_router();
	dynalinks.initialize();
	
	///
	document.getElementById("button-edit-page").onclick = function (e) {
		self.turn_edit();
	}

	
	//binding events
	var el = document.getElementById("button-add").onclick = function () { 
		self.add_item(); 
	}
	
	
	document.getElementById("search-button").onclick = function () {
		self.search(document.getElementById("search-box").value);
	}
	
	document.getElementById("button-create-category").onclick = function () {
		self.create_category();
	}
	
	document.getElementById("button-remove-category").onclick = function () {
		self.remove_category();
	}
	
	document.getElementById("button-remove-tag").onclick = function () {
		self.remove_tag();
	}
	
	document.getElementById("button-save").onclick = function () {
		dynalinks.save_to_file(self.Save_Filename);
	}
	
	document.getElementById("button-move").onclick = function () {
		self.move_tag();
	}
	
	document.getElementById("button-export-category").onclick = function () {
		self.export_category();
	}

	document.getElementById("button-export-tag").onclick = function () {
		self.export_tag();
	}

	
	document.getElementById("page-content").addEventListener("click", function (e) {
		var target = e.target || e.srcElement; 
		if (target.className === 'delete-btn') {
			self.remove_item( target.getAttribute('data-id') );
		}
		else if (target.className === 'edit-btn') {
			self.edit_item(target.getAttribute('data-id'));
		}
	}, false);
}



app = new Application(my_links);
