"use strict";

api.base_url = 'https://bigbad8ram.ashnazg.com/api/';
api.login = (username, password) => {
	return api.post('login', {username, password}).then(resp => {
		if (resp.code !== 200) throw resp;
		return resp.headers.authorization;
	});
};

api.bookings = {
	addUserToGame(eventId, userId) {
		console.error("untested");
		if (userId === undefined) {
			return pickUser().then(id => {
				if (id !== 'cancelled') {
					return api.bookings.addUserToGame(eventId, id);
				}
			});
		}
		return api.post('bookings/addUserToGame', {eventId, userId});
	},
	bookMeIntoGame(gameId) {
		console.error("untested", gameId);
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

api.users.me.isadmin = () => {
	return api.post('users/me/isadmin');
};

api.post2 = function() {
	return api.post.apply(null, arguments).then(resp => resp.body);
}

api.get2 = function() {
	return api.get.apply(null, arguments).then(resp => resp.body);
}
