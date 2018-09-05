(function() {
	"use strict";
	// true disables all xander magic (other than a one line css fix, since the css isn't dynamic.)
	// false enables ajax-everything.
	var SAFETY = false;

	if (SAFETY) {
		function enableLegacy() {
			var legacy_bookme = jQuery(".em-booking-button");
			if (legacy_bookme.length) return legacy_bookme.show();
			setTimeout(enableLegacy, 100);
		}
		return enableLegacy();
	}
	var absurl;
	function deathRattle(msg, line, col) {
		if (line) msg += ' line '+line;
		if (col) msg += ' col '+col;
		alert(absurl + " did not complete, try reloading the page or contacting tech support and showing them this error\n" + msg);
	}

	window.onerror = function(msg, url, line, col, error) {
		console.log({OLD: msg, url, line, col, error, absurl});
		if (absurl === url) deathRattle(msg, line, col);
	}
	/* nobody's using the above hook, so I don't have to feel bad for using it.
	console.log({olderr: window.onerror});
	window.addEventListener('error', function(err) {
		console.log(err);
	}, false);
	*/

	var dbg_shim = 1;
	window.$ = jQuery;
	var js = '/wp-content/themes/atahualpa/js/';
	var lib = '/wp-content/themes/atahualpa/plugins/xandermagic-libraries/';

	$("body").ajaxError(function(e, jqxhr, settings, exception) {
		console.error({e, settings, exception, jqxhr});
	});
	function run(urls, then) {
		if (urls.length) {
			var url = urls.shift();
			absurl = location.protocol + '//' + location.hostname + url;
			var stem = url.replace(/^.*\//, '').replace(/\.js$/, '');
			console.log("loading", url, stem);
			var script = document.createElement('script');
			script.setAttribute('src', url);
			window.LIB_LOADING = window.LIB_LOADING || {};
			script.onload = function() {
				setTimeout(() => {
					if (!window.LIB_LOADING[stem]) deathRattle(stem +' did not init');
					else return run(urls, then);
				}, 1);
			}
			script.onerror = function() {
				// this triggers on network errors, but not on parse errors.
				console.error(url + " had error", arguments);
			};
			document.body.appendChild(script);
		} else {
			if (then) then();
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
				ev.preventDefault();
				ev.stopImmediatePropagation();
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
		});
	}
	init();
})();
