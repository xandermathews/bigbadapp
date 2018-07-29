"use strict";

api.base_url = 'https://bigbad8ram.ashnazg.com/api/';
api.login = (username, password) => {
	return api.post('login', {username, password}).then(resp => {
		if (resp.code !== 200) throw resp;
		console.log(JSON.stringify({resp}, null, 2));
		return resp.headers.authorization;
	});
};
api.events = {
	me() {
		return api.get('events/me');
	}
};
