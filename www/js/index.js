"use strict";

var dbg = false;
var dispair = true;

document.addEventListener('pause', function() {
	console.log("pause");
});

document.addEventListener('resume', function() {
	console.log("resume");
});

function fail(e) {
	console.error(e);
}

var omni_button = $("button#available-games-btn");
function stateLoginTime() {
	$("body > .page > section").hide();
	omni_button.text("Login");
	api.authorization = undefined;
	localStorage.removeItem('Authorization');
}

function dialog(class_, attrs) {
	var dialog = gen('.quickmodal.'+class_, attrs, document.body);
	dialog.easyModal({
		onClose() {
			setTimeout(() => {
				// $("div.page").show();
				dialog.remove();
				$(".lean-overlay").remove();
			}, 0);
		}
	});
	setTimeout(() => {
		// $("div.page").hide();
		dialog.trigger('openModal');
	}, 0);
	dialog.close = function() {
		dialog.trigger('closeModal');
	}
	return dialog;
}

// var TODO more buttons
(function() {
	var buttons = gen.decorate(omni_button.parent());
	function button(text, click) {
		buttons.gen('button.btn.btn-warning.yellow-btns', {click, text});
	}

	/*
	button("test", () => {
		var foo = dialog("foo");
		foo.gen("button", "foobar");

	});
	*/
	button("my games", () => {
		api.events.me().then(resp => {
			console.log(JSON.stringify({server_response: resp}, null, 2));
			var d = dialog("nowrap");
			var t = d.gen('table.padded');
			resp.map(game => {
				var row = t.gen('tr');
				row.gen('td', game.eventId);
				row.gen('td', game.eventName);
				row.gen('td', game.eventStartDate + ` ${game.eventStartTime}->${game.eventEndTime}`);
			});
		});
	});
	button("games by user", () => {
		pickUser().then(id => {
			api.events.user(id).then(resp => {
				console.log(JSON.stringify({their: resp}, null, 2));
				var d = dialog("nowrap");
				var t = d.gen('table.padded');
				resp.map(game => {
					var row = t.gen('tr');
					row.gen('td', game.eventId);
					row.gen('td', game.eventName);
					row.gen('td', game.eventStartDate + ` ${game.eventStartTime}->${game.eventEndTime}`);
				});
			});
		});
	});
})();

var myself = {};
var users = {};
var games = { id: {}, day: {} };

function pickUser() {
	var d = Q.defer();
	var $user_picker = gen('.quickmodal.user-picker', null, document.body);
	$("div.page").hide();
	function exit(id) {
		return function() {
			$user_picker.trigger('closeModal');
			$user_picker.remove();
			d.resolve(id);
		}
	}
	$user_picker.gen('button', {text: 'cancel', click: exit('cancelled')});
	var table = $user_picker.gen('table');
	var users_spec = table.gen('tr');
	users_spec.gen('th', 'ID');
	users_spec.gen('th', '');
	users_spec.gen('th', 'Name');
	users_spec.gen('th', 'Email');
	Object.keys(users).map(id => {
		var row = table.gen('tr');
		var user = users[id];
		row.gen('td', user.id);
		row.gen('td/button', {text: 'select', click: exit(user.id)});
		row.gen('td', user.displayName);
		row.gen('td', user.userEmail);
	});
	$user_picker.easyModal({
		// hasVariableWidth: true,
		onClose: () => {
			$("div.page").show();
		}
	});
	$user_picker.trigger('openModal');
	return d.promise;
}

function storeGame(game) {
	if (!game.eventAttributes) {
		if (!dispair) console.warn("game eventAttributes is null:", game);
	}
	games.id[game.eventId] = game;
	games.day[game.eventStartDate] = games.day[game.eventStartDate] || [];
	games.day[game.eventStartDate].push(game);
	game.eventName = game.eventName || 'NULL';
	game.attendees = game.attendees || [];
	game.eventAttributes = game.eventAttributes || {};
	'System,GM,Length,Players'.split(',').map(f => {
		game.eventAttributes[f] = game.eventAttributes[f] || 'NULL';
	});
}

function updateGameDisplay(id) {
	var tbody = $(`#game${id}`).parent();
	var row = $(`#game${id}`);
	var expando = gen.decorate($(`#expando${id}>td.expando`));
	var game = games.id[id];
	row.empty();
	expando.empty();
	// if (dbg) return console.log(`updateGameDisplay(${id})`, game, row);

	var dump = Object.assign({}, game);
	delete dump.postContent;
	var text = game.postContent;
	function quick(hook, ...args) {
		args.unshift(game.eventId);
		console.log(args);
		return api.bookings[hook].apply(null, args).then(resp => {
			refreshGame(game.eventId);
			alert(hook +':\n' + JSON.stringify(resp, null, 2));
			return resp;
		}, err => {
			refreshGame(game.eventId);
			alert(hook +':\n' + JSON.stringify(err, null, 2));
			throw err;
		});
	}
	expando.gen('button', {text: 'refresh', click: () => refreshGame(game.eventId)});
	expando.gen('button', {text: 'bookMeIntoGame', click: () => quick('bookMeIntoGame')});
	expando.gen('button', {text: 'addUserToGame', click: () => quick('addUserToGame')});
	var users = expando.gen('table');
	var users_spec = users.gen('tr');
	users_spec.gen('th', 'Relation');
	users_spec.gen('th', 'ID');
	users_spec.gen('th', 'Name');
	users_spec.gen('th', 'Email');
	var pcs_signed_up = 0;
	var attendees = {};
	function showUser(user, type) {
		// console.log({user, type, t: typeof type});
		if (type !== 'Owner') {
			type = user.bookingComment || 'PC';
		}
		var promotion = false;
		if (type === 'PC') {
			++pcs_signed_up;
			promotion = true;
		}
		attendees[type] = attendees[type] || [];
		attendees[type].push(user);
		var row = users.gen('tr');
		row.gen('td', type);
		row.gen('td', user.id);
		row.gen('td', user.displayName);
		row.gen('td', user.userEmail);
		switch (type) {
			case 'Owner':
			case 'Host':
				break;
			case 'GM':
			case 'PC':
				row.gen('td/button', {text: 'kick', click: () => quick('removeUserFromGame', user.id)});
				row.gen('td/button', {text: promotion ? 'promote': 'demote', click: () => quick('setGmStatusForPlayerInGame', user.id, promotion)});
		}
	}
	showUser(game.eventOwner, 'Owner');
	game.attendees.map(showUser);
	expando.gen('p.gamedesc', text);

	var time = 'invalid';
	var length = game.eventAttributes.Length;
	if (game.eventStartDate) {
		if (game.eventStartTime) {
			if (game.eventEndDate) {
				if (game.eventEndTime) {
					var start = moment(game.eventStartDate +'T'+ game.eventStartTime);
					var end = moment(game.eventEndDate +'T'+ game.eventEndTime);
					time = start.format('ha') +'-'+ end.format('ha');
					if (length === 'NULL') length = end.diff(start, 'hours');
				} else {
					console.error('game', game.eventId, time = 'invalid eventEndTime');
				}
			} else {
				console.error('game', game.eventId, time = 'invalid eventEndDate');
			}
		} else {
			console.error('game', game.eventId, time = 'invalid eventStartTime');
		}
	} else {
		console.error('game', game.eventId, time = 'invalid eventStartDate');
	}
	var cats = game.categories ? game.categories.map(blob => blob.categoryName).join(', ') : 'NULL';
	function col(label, val) {
		return gen('td.'+label, val, row);
	}
	var gms = game.eventAttributes.GM;
	if (attendees.GM && attendees.GM.length) {
		gms = attendees.GM.map(gm => gm.displayName).join(', ');
	}
	var avail = game.eventAttributes.Players - pcs_signed_up;
	if (game.eventAttributes.Players === 'NULL') {
		avail = ''+ -pcs_signed_up;
		dump.avail = {pcs_signed_up, Players: game.eventAttributes.Players, avail};
	}
	col('id', game.eventId);
	col('time', time);
	col('event-name', game.eventName);
	col('system', game.eventAttributes.System);
	col('gm', gms);
	col('length', length);
	col('available', avail +' of '+ game.eventAttributes.Players);
	col('type', cats);

	// this is last so I can tag in dbg data into that dump
	expando.gen('pre.datadump', {text: JSON.stringify(dump, null, 2)});
}

function refreshGame(id) {
	try {
		console.log("refreshing", id);
		api.events.find(id).then(s => {
			storeGame(s.body);
			return updateGameDisplay(s.body.eventId);
		}).catch(e => console.error);
	} catch (e) {
		console.error(e);
	}
}

function enableSearch(all_games) {
	var user_count = Object.keys(users).length;
	if (myself.isadmin === false) user_count = 1;
	var seen = {};
	if (all_games && all_games.length) {
		if (user_count) {
			omni_button.text("Logout");
		} else {
			omni_button.text("Finding Users...");
		}
		games = { id: {}, day: {} };
		// var tbody = $("table.gamelist > tbody");
		all_games.forEach(game => {
			storeGame(game);
			seen[game.eventStartDate] = seen[game.eventStartDate] || 0;
			++seen[game.eventStartDate];
		});
		console.log(JSON.stringify({games_per_day: seen},null, 2));
		var section = $("section.games");
		section.empty();
		Object.keys(games.day).sort().map(k => {
			var todays_games = games.day[k].sort((a, b) => a.eventStartTime < b.eventStartTime);
			gen('header.section-header/h2.day', {text: moment(k).format('dddd MMMM Do')}, section);
			var gamelist = gen('table.gamelist.table.table-sm.table-responsive', null, section);
			var thead = gamelist.gen('thead/tr');
			thead.gen('td.id', 'id');
			thead.gen('td.time', 'Time');
			thead.gen('td.event-name', 'Event');
			thead.gen('td.system', 'System');
			thead.gen('td.gm', 'GM');
			thead.gen('td.length', 'Length');
			thead.gen('td.available', 'Available');
			thead.gen('td.type', 'Type');

			var tbody = gamelist.gen('tbody');
			todays_games.map(game => {
				var id = game.eventId;
				var row = tbody.gen(`tr#game${id}.game-summary`);
				var expando = tbody.gen(`tr#expando${id}/td.expando`, {colspan: 10, style: 'display: none'});
				row.click(() => {
					expando.toggle();
				});
				try {
					updateGameDisplay(game.eventId);
				} catch (e) {
					console.error(e);
				}
			});
		});
	} else if (user_count) {
		omni_button.text("Finding Games...");
	} else {
		omni_button.text("Finding Games and Users...");
	}
	if (dbg) console.info(`loading phase: ${omni_button.text()}`);
}

function stateUser() {
	$("body > .page > section").hide();
	$("body > .page > section.games").show();
	api.users.me().then(resp => {
		if (dbg && myself.isadmin !== true) console.log(JSON.stringify({me: resp.body},null, 2));
		var id = resp.body.id;
	});
	api.events.me().then(resp => {
		if (dbg) console.log(JSON.stringify({mygames: resp.map(g => g.eventId)}));
	});
	enableSearch();
	if (0) {
		var start = Date.now();
		if (dbg) console.log({start});
		var g = localStorage.getItem('games');
		var epoch = localStorage.getItem('epoch');
		// console.log("refreshing game cache", g = null);
		if (g && epoch) {
			g = JSON.parse(g);
			if (dbg) console.log("loaded games from cache", g);
			enableSearch(g);
			return api.events.since(epoch).then(resp => {
				if (dbg) console.log({epoch_load_response: resp, start, last: epoch});
				console.info(`games changed between ${moment(+epoch).fromNow()} and ${moment(start).fromNow()} (count ${resp.body.length})`);
				if (resp.body.length) localStorage.setItem('epoch', start);
			});
		}
		api.events.all().then(resp => {
			if (resp.body[0].eventId) {
				localStorage.setItem('games', JSON.stringify(resp.body));
				localStorage.setItem('epoch', start);
			}
			console.log("loaded games from server", resp);
			enableSearch(resp.body);
		}).catch(e=> {
			console.log("failed to /events/all:");
			console.error(e);
		});
	} else {
		api.events.year(2018).then(resp => {
			enableSearch(resp.body);
		}, e=> {
			console.log("failed to /events/year/2018:");
			console.error(e);
		});
	}
}

function stateAdmin() {
	myself.isadmin = true;
	api.users.id(myself.id).then(resp => {
		console.log(JSON.stringify({id: myself.id, admin_deets: resp.body},null, 2));
	});
	api.users.all().then(resp => {
		if (resp.code === 403) return;
		resp.body.map(user => {
			users[user.id] = user;
		});
		enableSearch();
	}, e=> {
		console.log("failed to /users/all:");
		console.error(e);
	});
	stateUser();
}

function testSession(token) {
	// api.authorization = token;
	$("body > .page > section").hide();
	omni_button.text("...");
	api.users.me().then(resp => myself = resp.body).then(() => {
		// myself = '<html>\r\n<head><title>502 Bad Gateway</title></head>\r\n<body bgcolor=\"white\">\r\n<center><h1>502 Bad Gateway</h1></center>\r\n<hr><center>nginx/1.10.3 (Ubuntu)</center>\r\n</body>\r\n</html>\r\n';
		if (typeof myself === 'string') {
			$(".page").show();
			return $("section.games").html(myself).show();
		}
		if (dbg) console.log(JSON.stringify({myself}, null, 2));
		myself.isadmin = 'TBD';
		api.users.me.isadmin().then(resp => {
			myself.isadmin = false;
			if (resp.body === true) return stateAdmin();
			if (0) {
				if (resp.body === false) return stateUser();
			} else {
				// until we've redacted properly we must not let users log in:
				if (resp.body === false) alert("not an admin");
			}
			return stateLoginTime();
		});
	});
}

document.addEventListener('deviceready', function() {
	/*
	var parentElement = document.getElementById('deviceready');
	var listeningElement = parentElement.querySelector('.listening');
	var receivedElement = parentElement.querySelector('.received');

	listeningElement.setAttribute('style', 'display:none;');
	receivedElement.setAttribute('style', 'display:block;');
	*/
	var $display = $("#deviceready");
	$display.find('.listening').hide();
	$display.find('.received').show();

	var $login_modal = gen('.quickmodal.login', null, document.body);
	var udata = {placeholder: 'username'};
	var pdata = {placeholder: 'password'};
	if (location.search.length) {
		// xander's login debugging mode
		var vars = {};
		var filter = /^([a-zA-Z0-9_-]+)=([a-zA-Z0-9_-]+)$/;
		location.search.substr(1).split('&').map(v => {
			var out = v.match(filter);
			if (out) vars[out[1]] = out[2];
		});
		if (vars.u) udata.value = vars.u;
		if (vars.p) pdata.value = vars.p;
	}

	var user = $login_modal.gen('input.user', udata);
	var pass = $login_modal.gen('input.pass', pdata);
	var subm = $login_modal.gen('button', {
		text: 'Login',
		click() {
			console.log("logging in as", user.val());
			api.login(user.val(), pass.val()).done(s => {
				$login_modal.trigger('closeModal');
				console.log({almost: s});
				// localStorage.setItem('Authorization', s);
				testSession(s);
			}, err => {
				if (err.code !== 401) fail(err);
				if (err.body && err.body.message) alert(err.body.message);
				else alert("FAIL: "+ JSON.stringify(err, null, 2));
			});
		}
	});
	$login_modal.easyModal({
		onOpen() {
			user.focus();
		}
	});

	omni_button.click(e => {
		console.log("clicked?", e, this);
		switch (e.currentTarget.innerText) {
			case 'Login':
				$login_modal.trigger('openModal');
			break;
			default:
			case 'Finding Games...':
			case 'Logout':
				localStorage.removeItem('Authorization');
				localStorage.removeItem('games');
				location.reload(true);
			break;
		}
		e.stopPropagation();
		e.preventDefault();
		return false;
	});
	var token = localStorage.getItem('Authorization');
	$("body > .page > section").hide();
	if (token) {
		testSession(token);
	} else {
		stateLoginTime();
	}
}, false);
