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
		setTimeout(() => {
			api.login('Xander', 'brake68care48dust94fire');
		}, 1000);
	}

	var user = $login_modal.gen('input.user', udata);
	var pass = $login_modal.gen('input.pass', pdata);
	var subm = $login_modal.gen('button', {
		text: 'Login',
		click() {
			console.log("logging in", user.val(), pass.val());
			api.login(user.val(), pass.val()).done(s => {
				console.log('wtf', s);
				localStorage.setItem('Authorization', s);
				api.authorization = s;
				api.events.me().done(s => {
					console.log('events:', s);
					s.text().done(text => {
						console.log('ANSWER:', text);
					}, fail);
				}, fail);
			}, fail);
		}
	});
	$login_modal.easyModal({
		onOpen() {
			user.focus();
		}
	});

	var $login = gen('button.login', {
		text: "login",
		click(e) {
			console.log("clicked?");
			e.stopPropagation();
			e.preventDefault();
			$login_modal.trigger('openModal');
			return false;
		}
	}, document.body);
}, false);
