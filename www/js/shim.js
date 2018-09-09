(function() {
	"use strict";
	// true disables all xander magic (other than a one line css fix, since the css isn't dynamic.)
	// false enables ajax-everything.
	var SAFETY = false;
	var dbg_shim = 0;

	function enableLegacy() {
		var legacy_bookme = jQuery(".em-booking-button");
		if (legacy_bookme.length) return legacy_bookme.show();
		setTimeout(enableLegacy, 100);
	}
	function iOSversion() {
		if (/iP(hone|od|ad)/.test(navigator.platform)) {
			// supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
			var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
			return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
		}
	}

	var lib = '/wp-content/themes/atahualpa/plugins/login-with-ajax/';
	var modules = [
		lib+'q.js',
		lib+"fetch-api.js",
		lib+'gen.js',
		lib+'api.js',
		lib+'magic.js'
	];
	// if we need to polyfill promises, try https://github.com/taylorhakes/promise-polyfill
	if (!window.fetch) {
		modules.unshift(lib+'fetch-polyfill.js');
	}

	var ver = iOSversion();
	if (dbg_shim) console.log({ver: ver});

	if (ver && ver[0] < 10) {
		// ios9 doesn't support syntax currently in use in the modules.
		// FIXED! polyfilled and removed fat-arrow syntax.
		// SAFETY = true;
	}

	if (SAFETY) {
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

	window.$ = jQuery;

	$("body").ajaxError(function(e, jqxhr, settings, exception) {
		console.error({e, settings, exception, jqxhr});
	});
	function run(urls, then) {
		if (urls.length) {
			var url = urls.shift();
			absurl = location.protocol + '//' + location.hostname + url;
			var stem = url.replace(/^.*\//, '').replace(/\.js$/, '');
			if (dbg_shim) console.log("loading", url, stem);
			var script = document.createElement('script');
			script.setAttribute('src', url);
			window.LIB_LOADING = window.LIB_LOADING || {};
			script.onload = function() {
				setTimeout(function() {
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
			if (dbg_shim) console.log("login attempted", arguments.length, arguments);
			if (arguments.length === 1 && magic.login()) {
				if (dbg_shim) console.log("magic said bail");
				ev.preventDefault();
				ev.stopImmediatePropagation();
				return false;
			}
			if (dbg_shim) console.log("magic said ok");
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

		run(modules, function() {
			if (dbg_shim) console.log("all shims loaded");
			magic.testSessionDesync(logout_button);
			if (location.host !== 'www.logictwine.com') return; // in prod, none of the rest is needed
			return gen('button', {
				text: 'run patcher',
				style: "position: fixed; top: 50px; opacity: .2; z-index: 10",
				click: function() {
					run([
						lib+'api.js',
						lib+'magic.js'
					]);
				}
			}, document.body);
		});
	}
	init();
})();
