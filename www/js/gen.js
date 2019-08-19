"use strict";

$.fn.enable = function(state) {
    if (state === undefined) state = true;
    return this.attr('disabled', !state);
};
$.fn.disable = function() {
    return this.attr('disabled', true);
};
$.fn.readonly = function(state) {
    if (state === undefined) state = true;
    return this.attr('readonly', state);
};
$.fn.writable = function() {
    return this.attr('readonly', false);
};

$.fn.gen2 = function(k, a) {
	return window.gen(k, a, this);
};

window.gen = function(key, attrs, parent) {
	key = key || 'div';
	attrs = attrs || {};
	if (typeof attrs === 'function') attrs = {click: attrs};
	if (typeof attrs !== 'object') attrs = {text: attrs};

	key = key.split(/[/>]/);
	if (key.length > 1) {
		var node = gen(key.shift(), null, parent);
		while (key.length > 1) {
			node = node.gen(key.shift());
		}
		return node.gen(key.shift(), attrs);
	}

	key = key[0].split('.');
	var tag_and_id = key.shift().split('#');
	var tag = tag_and_id.shift() || 'div';
	var id = tag_and_id.shift();
	if (key.length) attrs.class = key.join(' ');
	if (id) attrs.id = id;
	var ele = $('<'+tag+'>', attrs);
	if (parent) ele.appendTo($(parent));
	return gen.decorate(ele);
}

gen.decorate = function(ele) {
	ele.gen = function(key, attrs) {
		var child = gen(key, attrs, ele);
		if (child[0].tagName === 'TABLE') {
			child.horizontalRecords = function(schema, list) {
				var data_keys = [];
				var header = child.gen('tr');

				var col_names = Object.keys(schema);
				col_names.forEach(function(k) {
					data_keys.push(schema[k]);
					header.gen('th', {text: k});
				});

				return list.map(function(row) {
					var tr = child.gen('tr');
					col_names.map(function(name) {
						var data_key = schema[name];
						if (typeof data_key === 'function') {
							var result = data_key(row, tr);
							if (result) tr.gen('td').append(result);
						} else {
							tr.gen('td', {text: row[data_key]});
						}
					});
					return tr;
				});
			};

			child.verticalRecord = function(tup) {
				Object.keys(tup).filter(function(k) { return tup[k] != undefined; }).map(function(k) {
					var tr = child.gen('tr');
					tr.gen('td', {text: k});
					tr.gen('td', {text: tup[k]});
				});
				return child;
			};
		}
		return child;
	};
	return ele;
}
window.LIB_LOADING = window.LIB_LOADING || {};
window.LIB_LOADING['gen'] = true;
console.log("gen version 2019-08-14");
