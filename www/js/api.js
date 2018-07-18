"use strict";

var api = (function() {
	function get(path, control, conf) {
		control = control || {};
		conf = conf || {};
		conf.headers = conf.headers || {};
		conf.headers["Accept"] = conf.headers["Accept"] || "application/json";
		if (api.authorization) {
			conf.headers["Authorization"] = conf.headers["Authorization"] || api.authorization;
		}
		var p = fetch(api.srv + path, conf);
		if (control.error) p = p.catch(control.error);
		p = p.then(s => {
			s.h = {};
			for (var h of s.headers) {
				s.h[h[0]] = h[1];
				console.log(h[0], h[1]);
			}
			return s;
		});
		conf.cache = conf.cache || 'no-cache';
		conf.mode = conf.mode || 'cors';
		conf.credentials = conf.credentials || 'include';
		console.log("LAUNCHING");
		console.log(JSON.stringify({path, conf}, null, 2));
		return p;
	}

	function post(path, body, control, conf) {
		conf = conf || {};
		conf.method = 'POST';
		if (body !== undefined) conf.body = body;
		if (typeof body === 'object') conf.body = JSON.stringify(body);
		conf.headers = conf.headers || {};
		conf.headers["Content-Type"] = conf.headers["Content-Type"] || "application/json; charset=utf-8";
		//Authorization: magic
		console.log("PSTING", {conf, body});
		return get(path, control, conf);
	}

	function postForm(path, body, control, conf) {
		conf.headers = conf.headers || {};
		conf.headers["Content-Type"] = conf.headers["Content-Type"] || "application/x-www-form-urlencoded";
		return post(path, body, control, conf);
	}

	return {
		srv: 'https://bigbad8ram.ashnazg.com/api/',
		login(username, password) {
			return post('login', {username, password}).then(e => {
				if (e.h.authorization) return e.h.authorization;
				throw e;
			});
		},
		events: {
			me() {
				return get('events/me');
			}
		}
	};
})();
