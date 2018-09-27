"use strict";

var dbg_api_init = 1;
if (dbg_api_init) console.log("api started");
api.base_url = 'https://bigbadcon.com:8091/apidev/';
if (location.hostname === "www.bigbadcon.com" && !location.pathname.match(/^\/gameadminDEV/)) {
	api.base_url = 'https://bigbadcon.com:8091/api/';
}

console.log("API", api.base_url);

api.login = function(username, password) {
	api.authorization = null;
	localStorage.removeItem('Authorization');
	localStorage.removeItem('state');
	api.state = {};
	return api.post('login', {username, password}).then(function(resp) {
		console.log({given:{username, password}, got: resp});
		if (resp.code !== 200) throw resp;
		var auth = resp.headers.authorization;
		api.authorization = auth;
		localStorage.setItem('Authorization', auth);
		console.log({set: auth});
		return api.refreshState();
	});
};

api.refreshState = function(fast) {
	if (!api.authorization) return console.log("can't refresh state, have no api auth key");
	if (dbg_api_init) console.log("refreshing state", fast?"fast":"slow");

	var fin;
	var events = api.events.me().then(function(list_of_games) {
		if (dbg_api_init) console.log("e?", list_of_games);
		var events = {};
		list_of_games.map(function(game) {
			events[game.eventId] = game;
			if (dbg_api_init) console.info(game.eventId, game);
		});
		return api.state.my_events = events; // must _return_ to support being mixed with users.me()
	});

	if (fast) {
		fin = events;
	} else {
		// NOTE: users.me() nukes the other two, hence the lack of saving it directly to state.
		var me = api.users.me().then(function(resp_me) {
			return resp_me.body;
		});
		var isadmin = api.users.me.isadmin().then(function(resp_isadmin) {
			return api.state.isadmin = resp_isadmin && resp_isadmin.body === true;
		});

		fin = Q.all([me, isadmin, events]).then(function(results) {
			api.state = results[0];
			api.state.isadmin = results[1];
			api.state.my_events = results[2];
		});
	}
	return fin.then(function() {
		localStorage.setItem('state', JSON.stringify(api.state));
		api.state.fresh = true;
		return api.state;
	});
};

api.bookings = {
	addUserToGame(eventId, userId) {
		console.error("untested");
		if (userId === undefined) {
			return pickUser().then(function(id) {
				if (id !== 'cancelled') {
					return api.bookings.addUserToGame(eventId, id);
				}
			});
		}
		return api.post('bookings/addUserToGame', {eventId, userId});
	},
	bookMeIntoGame(gameId) {
		return api.post('bookings/bookMeIntoGame', {gameId});
	},
	removeUserFromGame(eventId, userId) {
		console.error("untested");
		return api.post('bookings/removeUserFromGame', {eventId, userId});
	},
	setGmStatusForPlayerInGame(eventId, userId, isGm) {
		console.error("untested");
		return api.post('bookings/setGmStatusForPlayerInGame', {eventId, userId, isGm});
	}
};

api.events = {
	all() {
		return api.get('events/all');
	},
	// TODO https://bigbad8ram.ashnazg.com/api/swagger-ui.html#!/events-controller/findByCategoryUsingGET
	// TODO https://bigbad8ram.ashnazg.com/api/swagger-ui.html#!/events-controller/getCountUsingGET
	// TODO https://bigbad8ram.ashnazg.com/api/swagger-ui.html#!/events-controller/getCountForYearUsingGET
	find(id) {
		return api.post('events/find', {id});
	},
	// TODO https://bigbad8ram.ashnazg.com/api/swagger-ui.html#!/events-controller/findForMeUsingGET
	// TODO https://bigbad8ram.ashnazg.com/api/swagger-ui.html#!/events-controller/findForMeForYearUsingGET
	// TODO GET /events/page/{length}/{offset} https://bigbad8ram.ashnazg.com/api/swagger-ui.html#!/events-controller/findPageUsingGET
	since(epoch) {
		return api.get('events/since/'+ epoch);
	},
	user(id) {
		return api.post2('events/user', {id});
	},
	year(yr) {
		return api.get('events/year/'+yr);
	},
	me() {
		return api.get2('events/me');
	},
};
api.users = {
	all() {
		return api.post('users/all');
	},
	id(id) {
		return api.post('users/id', {id});
	},
	me() {
		return api.post('users/me');
	},
	username() {
		console.error("untested");
		return api.post('users/username');
	},
};

api.users.me.isadmin = function() {
	return api.post('users/me/isadmin');
};

api.post2 = function() {
	return api.post.apply(null, arguments).then(function(resp) {return resp.body; });
};

api.get2 = function() {
	return api.get.apply(null, arguments).then(function(resp) { return resp.body; });
};

(function() {
	api.authorization = localStorage.getItem('Authorization');
	if (!api.authorization) return console.log("can't refresh state, have no api auth key");

	if (!api.state) {
		if (dbg_api_init) console.log("init api.state");
		api.state = {};
		try {
			var cache = localStorage.getItem('state');
			if (cache) cache = JSON.parse(cache);
			if (cache) api.state = cache;
			api.state.fresh = false;
			if (dbg_api_init) console.log("loaded", cache);
		} catch (e) {
			console.error("error during state recovery", e);
		}
	}

	api.refreshState(api.state.id != undefined);
})();
window.LIB_LOADING = window.LIB_LOADING || {};
window.LIB_LOADING['api'] = true;

