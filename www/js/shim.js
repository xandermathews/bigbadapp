(function() {
	"use strict";
	// true disables all xander magic (other than a one line css fix, since the css isn't dynamic.)
	// false enables ajax-everything.
	var SAFETY = true;

	if (SAFETY) {
		var legacy_bookme = jQuery(".em-booking-button");
		return legacy_bookme.show();
	}

	var dbg_shim = 1;
	window.$ = jQuery;
	var js = '/wp-content/themes/atahualpa/js/';
	var lib = '/wp-content/themes/atahualpa/plugins/xandermagic-libraries/';

	$("body").ajaxError(function(e, jqxhr, settings, exception) {
		console.error({e, settings, exception, jqxhr});
	});
	function run(urls, then) {
		if (1) {
			if (urls.length) {
				var url = urls.shift();
				var stem = url.replace(/^.*\//, '').replace(/\.js$/, '');
				console.log("loading", url, stem);
				var script = document.createElement('script');
				script.setAttribute('src', url);
				window.LIB_LOADING = window.LIB_LOADING || {};
				script.onload = function() {
					setTimeout(() => {
						if (!window.LIB_LOADING[stem]) alert(url + " did not complete, try reloading the page or contacting tech support");
						else return run(urls, then);
					}, 1);
				}
				script.onerror = function() {
					// this triggers on network errors, but not on parse errors.
					console.error(url + " had error", arguments);
				};
				document.body.appendChild(script);
			} else {
				console.log("running then");
				if (then) then();
			}
		} else if (0) {
			urls.map(src => {
				if (dbg_shim) console.log("loading", src);
				$('<script>', {src}).appendTo(document.body);
			});
			setTimeout(then, 1000);
		} else {
			if (!urls || urls.length === 0) {
				if (then) then();
				return;
			}
			var url = urls.shift();

			if (dbg_shim) console.log("attempting", url);
			$.getScript(url, function() {
				if (dbg_shim) console.log("loaded", url);
				setTimeout(function() {
					run(urls, then);
				}, 1);
			});
		}
	}

	function init() {
		var logout_button = $("#wp-logout");
		var login_button = $("#lwa_wp-submit, #wp-submit");
		if (logout_button.length + login_button.length === 0) return setTimeout(init, 100);

		login_button.click(function(ev) {
			if (dbg_shim) console.log("login attempted");
			if (magic.login()) {
				console.log("magic said bail");
				event.preventDefault();
				event.stopImmediatePropagation();
				return false;
			}
			console.log("magic said ok");
		});

		logout_button.click(function(ev) {
			localStorage.removeItem('Authorization');
			if (dbg_shim) console.log("CLICKED");
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
			if (dbg_shim) console.log("all shims loaded");
			magic.testSessionDesync(logout_button);
			if (location.host !== 'www.logictwine.com') return; // in prod, none of the rest is needed
			return gen('button', {
				text: 'run patcher',
				style: "position: fixed; top: 50px; opacity: .2; z-index: 10",
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
