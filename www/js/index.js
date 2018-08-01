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

var all_games = [];
var all_users = [];
var users = {};
var games = { id: {}, day: {} };

function noteUser(user) {
	if (user) users[user.id] = user;
}

var seen = {};

function enableSearch() {
	if (all_games.length) {
		omni_button.text("Hide Full Games");
		var tbody = $("table.gamelist > tbody");
		all_games.forEach(game => {
			if (!game.eventAttributes) {
				console.warn("game eventAttributes is null:", game.eventStartDate);
				// console.log(JSON.stringify(game, null, 2));
			}
			games.id[game.eventId] = game;
			noteUser(game.eventOwner);
			games.day[game.eventStartDate] = games.day[game.eventStartDate] || [];
			games.day[game.eventStartDate].push(game);
			seen[game.eventStartDate] = seen[game.eventStartDate] || 0;
			++seen[game.eventStartDate];
			game.attendees.map(noteUser);
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

			var tbody = gamelist.gen('tbody');
			todays_games.map(game => {
				var row = tbody.gen('tr');

				var dump = Object.assign({}, game);
				delete dump.postContent;
				var html = game.postContent;
				var expando = tbody.gen('tr/td', {colspan: 10, style: 'display: none', html});
				expando.gen('pre', {text: JSON.stringify(dump, null, 2)});

				var start = game.eventStartDate + 'T' + game.eventStartTime;
				var end = game.eventEndDate + 'T' + game.eventEndTime;
				row.gen('td.time', moment(start).format('ha')+'-'+moment(end).format('ha'));
				row.gen('td.event-name', {
					text: game.eventName,
					click: function() {
						expando.toggle();
					}
				});
				row.gen('td.system', game.eventAttributes.System);
				row.gen('td.gm', game.eventAttributes.GM);
				row.gen('td.length', game.eventAttributes.Length);
				row.gen('td.available', game.attendees.length -1 + ' of ' + game.eventAttributes.Players);
			});
		});
	}
}

function stateUser() {
	$("body > .page > section").hide();
	$("body > .page > section.games").show();
	omni_button.text("Finding Games...");
	all_games = [];
	all_users = [];
	var g = localStorage.getItem('games');
	g = null;
	if (g) {
		g = JSON.parse(g);
		all_games = g;
		return enableSearch();
	}
	if (0) api.events.all().then(resp => {
		all_games = resp.body;
		localStorage.setItem('games', JSON.stringify(all_games));
		enableSearch();
	}, e=> {
		console.log("failed to /events/all:");
		console.error(e);
	});
	else
	api.events.year(2018).then(resp => {
		all_games = resp.body;
		// localStorage.setItem('games', JSON.stringify(all_games));
		enableSearch();
	}, e=> {
		console.log("failed to /events/all:");
		console.error(e);
	});
	api.users.all().then(resp => {
		if (resp.code === 403) return;
		all_users = resp.body;
		enableSearch();
	}, e=> {
		console.log("failed to /users/all:");
		console.error(e);
	});
}

function stateAdmin() {
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

	var $login_modal = gen('.login', null, document.body);
	var udata = {placeholder: 'username'};
	var pdata = {placeholder: 'password'};
	if (0) {
		// xander's api debugging mode
		udata.value = 'Xander';
		pdata.value = 'brake68care48dust94fire';
	}

	var user = $login_modal.gen('input.user', udata);
	var pass = $login_modal.gen('input.pass', pdata);
	var subm = $login_modal.gen('button', {
		text: 'Login',
		click() {
			console.log("logging in", user.val(), pass.val());
			api.login(user.val(), pass.val()).done(s => {
				console.log('wtf', s);
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
