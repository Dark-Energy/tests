﻿/*
Utils functions

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
	this.default_route = {callback: callback, obj, obj};
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


function _add_id(data)
{
	for(var cat in data) {
		arr = data[cat];
		for(var i =0; i < arr.length; i++) {
			if (!arr[i]._id) {
				arr[i]._id = Dynalinks.Utils.create_id();
			}
		}
	}
}


function Dynalinks(data, display)
{
	this.database = data.database;
	//_add_id(data.database);
	this.names = data.names;
	this.categories = {};
	this.display = display;
	
	this.initialize();
}

Dynalinks.prototype.Database_Name = "database.txt";

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
}

/*
	CONTEXT
*/
Dynalinks.Context = function (data, category)
{
	this.category_name = category;
	this.pages = {};
	this.favorites = new Array();
	this.tags = new Array();
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
		if (item.favorite || item.favorite_text) {
			if (item.favorite && !item.favorite_text) {
				item.favorite_text = item.text;
			}
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
	item.favorite = !!item.favorite;	
	if (item.favorite !== favorite) {
		if (item.favorite) {
			this.favorites.remove( function (i) { return i._id === item._id; } );
		}
		else {
			if (!item.favorite_text) {
				item.favorite_text = item.text;
			}
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
	for(var i = 0; i < this.tags.length; i++) {
		if (this.tags[i] === tag) {
			this.tags.splice(i, 1);
			return;
		}
	}
	
	//clean favorite list
	this.favorites.remove( function (i) {return i.tag === tag;});
}

Dynalinks.Context.prototype.add_item = function (item)
{
	Dynalinks.Utils.check_item(item);
	
	if (this.hash[item._id]) {
		return;
	}
	var page = this.get_page(item.tag);
	page.push(item);
	if (item.favorite) {
		if (!item.favorite_text) {
			item.favorite_text = item.text;
		}
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
	if (!name || !this.context.pages[name]) {
		var old_name = name;
		name = get_first_key_secure(this.context.pages);
		console.log("page " + old_name + " not found, show page "+name);
		if (!name) {
			console.log("category is empty, there are not page for show they");
			return;
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
	this.category_menu = ko.observableArray(dictionary_to_array(my_links.names, "hash", "text"));
	ko.applyBindings(this, document.getElementById("category-menu"));
}

Dynalinks.prototype.add_routes = function()
{
	mr = new My_Router();
	mr.add_route(":category/:page", 
	function (category, page) {
		if (this.current_category 
		&& this.current_category === category) {
			this.show_page(page);
		}
		else {
			this.show_category(category);
			this.show_page(page);
		}
	}, this);
		
	mr.add_route(":category", function (category) {
		this.show_category(category);		
		this.show_page(null);
	}, this);
	
	mr.add_default(function () {
		this.show_category(null);
		this.show_page(null);
	}, this);
	mr.start(true);	
}

var mr;

Dynalinks.prototype.initialize = function ()
{
	this.add_routes();
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
	console.log(item.tag, context.hash[item._id]);
	
	mr.navigate(category + "/" + item.tag, true);
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
	this.database[name] = new Array();
	this.names[name] = name;
	this.category_menu.push({hash:name, text: name});
	mr.navigate(name, true);
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
		this.add_category(name);
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
	
	//3. reshow page
	mr.navigate( new_category + "/"+tag, true);
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
	if (old.favorite != new_value.favorite) {
		this.context.change_favorite(item, new_value.favorite, new_value.favorite_text);
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
	mr.navigate(this.context.category_name + "/" + old.tag, true);	
	
}

Dynalinks.prototype.export_category = function (name)
{
	this.save_data_to_file(name + ".txt", this.database[name], "my_cat");
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
	if (this.context.category_name === name) {
		mr.navigate(get_first_key(this.names), true);
	}
}

/*
APPLICATION
*/

function Application()
{
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
		self.dynalinks.move_tag(
			self.dynalinks.context.current_tag, 
			self.dynalinks.context.category_name, 
			value.new_category || value.category);
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
		self.dynalinks.add_link_to_category(value, self.dynalinks.context.category_name);	
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
		self.dynalinks.update_item(item, value);
	}
	var form = new PopupForm(params);
	form.show();
	
}

Application.prototype.turn_edit = function ()
{
	
}

Application.prototype.export_category = function ()
{
	this.dynalinks.export_category(this.dynalinks.context.category_name);
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
		mr.navigate(self.dynalinks.context.category_name, true);
	}
	var form = new PopupForm(params);
	form.show();
}

var dynalinks;

Application.prototype.Initialize = function ()
{
	//hack, get database name for 'save' function
	var tmp = window.location.href.split('#')[0].split('/');
	tmp = tmp[tmp.length-1].split('.');
	this.Save_Filename = tmp[0]  + ".txt";
	
	var self = this;
	var display = {};
	this.display = display;
	display.mode = 'page_view';
	display.templates = {};
	display.templates['page_edit'] = 'template-page-content-edit'
	display.templates['page_view'] = 'template-page-content';
	
	dynalinks = this.dynalinks = new Dynalinks(my_links, display);
	
	///
	document.getElementById("button-edit-page").onclick = function (e) {
		if (dynalinks.display.mode === "page_view") {
			dynalinks.display.mode = "page_edit";
		}
		else {
			dynalinks.display.mode = "page_view";
		}
		dynalinks.show_page(dynalinks.context.current_tag);
	}

	
	//binding events
	var el = document.getElementById("button-add");
	el.onclick = function () 
	{ 
		self.add_item(); 
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



app = new Application();