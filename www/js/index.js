"use strict";

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

var users = {};
var games = { id: {}, day: {} };

function pickUser() {
	var $user_picker = gen('.modal.user-picker', null, document.body);
	$("div.page").hide();
	function exit(id) {
		return function() {
			$user_picker.trigger('closeModal');
			$user_picker.remove();
			d.resolve(id);
		}
	}
	var d = Q.defer();
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
		hasVariableWidth: true,
		onClose: () => {
			$("div.page").show();
		}
	});
	$user_picker.trigger('openModal');
	return d.promise;
}

function enableSearch(all_games) {
	var seen = {};
	if (all_games.length) {
		games = { id: {}, day: {} };
		omni_button.text("Hide Full Games");
		var tbody = $("table.gamelist > tbody");
		all_games.forEach(game => {
			if (!game.eventAttributes) {
				console.warn("game eventAttributes is null:", game.eventStartDate);
				// console.log(JSON.stringify(game, null, 2));
			}
			games.id[game.eventId] = game;
			games.day[game.eventStartDate] = games.day[game.eventStartDate] || [];
			games.day[game.eventStartDate].push(game);
			seen[game.eventStartDate] = seen[game.eventStartDate] || 0;
			++seen[game.eventStartDate];
			game.eventName = game.eventName || 'NULL';
			game.attendees = game.attendees || [];
			game.eventAttributes = game.eventAttributes || {};
			'System,GM,Length,Players'.split(',').map(f => {
				game.eventAttributes[f] = game.eventAttributes[f] || 'NULL';
			});
		});
		console.log(JSON.stringify({games_per_day: seen},null, 2));
		var section = $("section.games");
		section.empty();
		Object.keys(games.day).sort().map(k => {
			var todays_games = games.day[k].sort((a, b) => a.eventStartTime < b.eventStartTime);
			gen('header.section-header/h2.day', {text: moment(k).format('dddd MMMM Do')}, section);
			var gamelist = gen('table.gamelist.table.table-sm.table-responsive', null, section);
			var thead = gamelist.gen('thead/tr');
			thead.gen('td.time', 'Time');
			thead.gen('td.event-name', 'Event');
			thead.gen('td.system', 'System');
			thead.gen('td.gm', 'GM');
			thead.gen('td.length', 'Length');
			thead.gen('td.available', 'Available');
			thead.gen('td.type', 'Type');

			var tbody = gamelist.gen('tbody');
			todays_games.map(game => {
				var row = tbody.gen('tr.game-summary');

				var dump = Object.assign({}, game);
				delete dump.postContent;
				var text = game.postContent;
				var expando = tbody.gen('tr/td', {colspan: 10, style: 'display: none'});
				function quick(hook, ...args) {
					args.unshift(game.eventId);
					console.log(args);
					return api.bookings[hook].apply(null, args).then(resp => {
						alert(hook +':\n' + JSON.stringify(resp, null, 2));
						return resp;
					}, err => {
						alert(hook +':\n' + JSON.stringify(err, null, 2));
						throw err;
					});
				}
				expando.gen('button', {text: 'bookMeIntoGame', click: () => quick('bookMeIntoGame')});
				expando.gen('button', {text: 'addUserToGame', click: () => quick('addUserToGame')});
				var users = expando.gen('table');
				var users_spec = users.gen('tr');
				users_spec.gen('th', 'Relation');
				users_spec.gen('th', 'ID');
				users_spec.gen('th', 'Name');
				users_spec.gen('th', 'Email');
				var pcs_signed_up = 0;
				function showUser(user, type) {
					console.log({user, type, t: typeof type});
					if (type !== 'Owner') {
						type = user.bookingComment || 'PC';
					}
					var promotion = false;
					if (type === 'PC') {
						++pcs_signed_up;
						promotion = true;
					}
					var row = users.gen('tr');
					row.gen('td', type);
					row.gen('td', user.id);
					row.gen('td', user.displayName);
					row.gen('td', user.userEmail);
					if (type !== 'Owner') {
						row.gen('td/button', {text: 'kick', click: () => quick('removeUserFromGame', user.id)});
						row.gen('td/button', {text: promotion ? 'promote': 'demote', click: () => quick('setGmStatusForPlayerInGame', user.id, promotion)});
					}
				}
				showUser(game.eventOwner, 'Owner');
				game.attendees.map(showUser);
				expando.gen('p', text);
				expando.gen('pre', {text: JSON.stringify(dump, null, 2)});
				row.click(() => {
					expando.toggle();
				});

				var start = game.eventStartDate + 'T' + game.eventStartTime;
				var end = game.eventEndDate + 'T' + game.eventEndTime;
				var cats = game.categories ? game.categories.map(blob => blob.categoryName).join(', ') : 'NULL';
				row.gen('td.time', moment(start).format('ha')+'-'+moment(end).format('ha'));
				row.gen('td.event-name', game.eventName);
				row.gen('td.system', game.eventAttributes.System);
				row.gen('td.gm', game.eventAttributes.GM);
				row.gen('td.length', game.eventAttributes.Length);
				row.gen('td.available', game.eventAttributes.Players - pcs_signed_up + ' of ' + game.eventAttributes.Players);
				row.gen('td.type', cats);
			});
		});
	}
}

function stateUser() {
	$("body > .page > section").hide();
	$("body > .page > section.games").show();
	omni_button.text("Finding Games...");
	if (0) {
		var g = localStorage.getItem('games');
		// g = null;
		if (g) {
			g = JSON.parse(g);
			return enableSearch(g);
		}
		api.events.all().then(resp => {
			localStorage.setItem('games', JSON.stringify(resp.body));
			enableSearch(resp.body);
		}, e=> {
			console.log("failed to /events/all:");
			console.error(e);
		});
	} else {
		api.events.year(2018).then(resp => {
			enableSearch(resp.body);
		}, e=> {
			console.log("failed to /events/all:");
			console.error(e);
		});
	}
	api.users.all().then(resp => {
		if (resp.code === 403) return;
		resp.body.map(user => {
			users[user.id] = user;
		});
		// enableSearch();
	}, e=> {
		console.log("failed to /users/all:");
		console.error(e);
	});
}

function stateAdmin() {
	console.log("grats");
	stateUser();
}

function testSession(token) {
	api.authorization = token;
	$("body > .page > section").hide();
	omni_button.text("...");
	api.users.me.isadmin().then(resp => {
		if (resp.body === true) return stateAdmin();
		if (resp.body === false) return stateUser();
		return stateLoginTime();
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

	var $login_modal = gen('.modal.login', null, document.body);
	var udata = {placeholder: 'username'};
	var pdata = {placeholder: 'password'};
	if (0) {
		// xander's api debugging mode
		udata.value = 'SantaWolf';
		pdata.value = 'brake68care48dust94fire';
	}

	var user = $login_modal.gen('input.user', udata);
	var pass = $login_modal.gen('input.pass', pdata);
	var subm = $login_modal.gen('button', {
		text: 'Login',
		click() {
			console.log("logging in", user.val(), pass.val());
			api.login(user.val(), pass.val()).done(s => {
				$login_modal.trigger('closeModal');
				localStorage.setItem('Authorization', s);
				testSession(s);
			}, err => {
				if (err.code !== 401) fail(e);
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
		}
		e.stopPropagation();
		e.preventDefault();
		return false;
	});
	var token = localStorage.getItem('Authorization');
	$("body > .page > section").hide();
	if (token) {
		console.log("found", token);
		testSession(token);
	} else {
		stateLoginTime();
	}
}, false);
