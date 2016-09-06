
function glue(prev)
{
	return {"prev":prev};
}

function test_edit_form()
{
	var params = {};
	params.type = "label";
	params.value = "Test?";

	params = glue(params);
	params.type = "select";
	params.dict = {
		"1": "one",
		"2": "two",
		"3": "three"
	};
	params.selected = '3';
	
	params = glue(params);
	params.type = 'text';
	params.value = 'dummy';
	
	params = glue(params);
	params.type = "custom";
	params.title = "Custom Test";
	
	params.form = document.createElement("div");
	
	var text = document.createElement("label");
	text.appendChild(document.createTextNode("First Field"));
	params.form.appendChild(text);
	var input = document.createElement("input");
	input.type = 'text';
	input.value = 'first';
	params.form.appendChild( input );

	test_form(params);	
}

//recursive testing
function test_form(params, callback)
{
	var form = new PopupForm(params);
	form.handler = function (value) {
		console.log("Form Event: pressed Ok Button! value is ", value);
		if (params.prev) {
			test_form(params.prev);
		}
	}
	form.show();
}


function test()
{
	dynalinks.add_category("new category");
	dynalinks.add_link_to_category({href: "asdf", text: "test", tag: "new tag"}, "new category");
	dynalinks.move_tag("new tag", "new category", "news");
}

function test_add_category()
{
	var params = {};
	params.type = "text";
	params.title = "Add category";
	params.handler = function (value) {
		dynalinks.add_category(value);
	}
	var form = new PopupForm(params);
	form.show();
}

function test_add_link()
{
	var params = {};
	params.type = "custom";
	params.form = document.createElement("div");
	params.form.innerHTML = "<p><b>Адрес</b> <input type='text' data-value='href'>\
	<p><b>Текст</b> <input type='text' data-value='text'>\
	<p>Тэг <select></select>\
	<p>или новый <input type='text' data-value='new_tag'>\
	<p>Избранное <input type='checkbox' data-value='favorite'> \
	<p>Текст для избранного<input type='text' data-value='favorite-text'>";
	
	
	params.handler = function (value) {
		console.log(value);
	}
	var form = new PopupForm(params);
	form.show();
}

function test_add_link_ko()
{
	var params = {};
	params.type = "custom";
	var foo = document.createElement("div");
	var tags = ["first", "second", "third"];
	var selected = ["third"];
	var context = {};
	context.tags = dynalinks.context.tags;
	context.selected = [dynalinks.context.current_tag];
	ko.renderTemplate("create-item-template", context, {}, foo);
	params.form = foo;
	
	params.handler = function (value) {
		console.log(value);
	}
	
	var form = new PopupForm(params);
	form.show();

}

function test_edit_link_ko()
{
	var params = {};
	params.type = "custom";
	var foo = document.createElement("div");
	var context = {};
	var item = dynalinks.context.pages[dynalinks.context.tags[0]][0];
	context.tags = dynalinks.context.tags;
	context.text = item.text;
	context.href = item.href;
	context.favorite = item.favorite || !!item.favorite_text;
	context.favorite_text = item.favorite_text;
	context.tag = item.tag;
	ko.renderTemplate("edit-item-template", context, {}, foo);
	params.form = foo;
	
	params.handler = function (value) {
		console.log(value);
	}
	
	var form = new PopupForm(params);
	form.show();

}


function test_edit_form_textarea()
{
	var params = {};
	params.type = "textarea";
	params.value = "<p>asdfasdfadf <b>asdfdsf</b> <p>asdf asdfas fds fds";
	params.not_escape = true;
	params.handler = function (value) {
		console.log("ok ", value);
	}
	
	var form = new PopupForm(params);
	form.show();
}


function test_edit_form_textarea()
{
	var params = {};
	params.type = "custom";
	
	params.fields = [
		{
		"data-value" : "comment",
		"type": "textarea",
		"value": "<p>asdfasdfadf <b>asdfdsf</b> <p>asdf asdfas fds fds"
		},
		{
		"type": "text",
		"value": "my text",
		"data-value": "tag",
		}
	];

	params.not_escape = true;
	params.handler = function (value) {
		console.log("ok ", value);
	}
	
	var form = new PopupForm(params);
	form.show();

}


document.addEventListener("DOMContentLoaded", function(event) { 
	//test_edit_form();
	//test_add_category();
	//test_edit_link_ko();
	//test_edit_form_textarea();
});
