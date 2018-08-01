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
		return api.post('bookings/addUserToGame', {eventId, userId});
	},

	bookMeIntoGame(gameId) {
		console.error("untested");
		return api.post('bookings/bookMeIntoGame', {gameId});
	},
	removeUserFromGame(eventId, userId) {
		console.error("untested");
		return api.post('bookings/removeUserFromGame', {eventId, userId});
	}
};

api.events = {
	all() {
		return api.get('events/all');
	},
	find(id) {
		console.error("untested");
		return api.post('events/find', {id});
	},
	year(yr) {
		return api.get('events/year/'+yr);
	},
	user(id) {
		console.error("untested");
		return api.post('events/user', {id});
	},
	me() {
		console.error("untested");
		return api.get('events/me');
	},
};
api.users = {
	all() {
		console.error("untested");
		return api.post('users/all');
	},
	id(id) {
		console.error("untested");
		return api.post('users/id', {id});
	},
	me() {
		console.error("untested");
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

