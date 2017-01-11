
Application.prototype._child_init = function ()
{
	this.dynalinks.Database_Var = "my_links";
	this.register_ko_items();
}


Application.prototype.register_ko_items = function ()
{
	ko.components.register('autodate', 
	{
		template: '<p data-value="date", data-bind= "text: now_date">',
		viewModel: function (params) 
		{
			this.get_date = function () {
				return new Date().toISOstring();
			}
			var t = new Date();
			this.now_date = t.toISOString();
			//this.now_date = ko.observable(t.toISOString());
		}
	});

	
	ko.bindingHandlers.my_text =  {
		init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
			var text = ko.unwrap(valueAccessor());
			element.value = text;
		},
		update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
			var text = ko.unwrap(valueAccessor());
			element.value = text;
		}
	};

	var scum = document.createElement('textarea');	
	ko.components.register('my_textarea', 
	{
		template: '<textarea data-bind="value:text, attr:{cols:cols, rows:rows}"></textarea>',
		viewModel: function (params) 
		{
			this.text = params.text;
			this.rows = params.rows;
			this.cols = params.cols;
		}
	});
}




!(function () {
	if (typeof my_links === 'undefined') {
		var my_links = {
		database: {},
		names: {}
		};
	}
})();
var app = new Application(my_links);