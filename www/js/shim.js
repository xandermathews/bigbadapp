(function() {
	"use strict";
	window.$ = jQuery;
	var js = '/wp-content/themes/atahualpa/js/';
	var lib = '/wp-content/themes/atahualpa/plugins/xandermagic-libraries/';

	function run(urls, then) {
		// var s = $('<script>', {src: url}).appendTo(document.body);
		if (!urls || urls.length === 0) {
			if (then) then();
			return;
		}
		var url = urls.shift();
		$.getScript(url, function() {
			console.log("loaded", url);
			setTimeout(function() {
				run(urls, then);
			}, 1);
		});
	}

	function init() {
		var logout_button = $("#wp-logout");
		var login_button = $("#lwa_wp-submit, #wp-submit");
		if (logout_button.length + login_button.length === 0) return setTimeout(init, 100);

		login_button.click(function(ev) {
			console.log("login attempted");
			if (magic.login()) {
				event.preventDefault();
				event.stopImmediatePropagation();
				return false;
			}
		});

		logout_button.click(function(ev) {
			localStorage.removeItem('Authorization');
			console.log("CLICKED");
			// var url = $(this).attr('href');
			// location = url;

			// event.preventDefault();
			// event.stopImmediatePropagation();
			// return false;
		});

		run([
			lib+'q.js',
			lib+"fetch-api.js",
			lib+'gen.js',
			lib+'api.js',
			js+'magic.js'
		], function() {
			magic.testSessionDesync(logout_button);
			return gen('button', {
				text: 'run patcher',
				style: "position: fixed; top: 0; opacity: .2;",
				click: function() {
					run([
						lib+"fetch-api.js",
						lib+'gen.js',
						lib+'api.js',
						js+'magic.js'
					]);
				}
			}, document.body);
			function hash(s) {
				var adder = 0;
				var hash = 0;
				for (var i = 0; i < s.length; ++i) {
					adder += s.charCodeAt(i);
					hash += adder;
				}
				return hash;
			}
			var last_hashes = {};
			function livereload(url) {
				api.get(url).then(resp => {
					console.log({given: resp.body, hash: hash(resp.body)});
					var hashval = hash(resp.body);
					if (last_hashes[url] !== hashval) {
						last_hashes[url] = hashval;
						run([url], function() {});
					}
					// setTimeout(livereload, 1000);
				});
			}
			livereload(js+'magic.js');
			livereload(lib+'api.js');
		});
	}
	init();
})();
