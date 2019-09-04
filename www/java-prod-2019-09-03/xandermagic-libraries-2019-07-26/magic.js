(function() {
	"use strict";
	var dbg = {
		booking: function() {
			console.log.apply(console, arguments);
		},
		login: function() {
			console.log.apply(console, arguments);
		},
	};
	var redundant_looping_block = null; // paranoia about there being some browser bug that causes my "login, retry form submission" to go into an infinite loop.

	function testSession() {
		var jwt = localStorage.getItem('Authorization');
		var uid = localStorage.getItem('state');
		if (jwt && uid && uid !== 'undefined') return {jwt, uid};
		return null;
	}

	function dualSession() {
		try {
			if (testSession()) return false; // let wordpress get the event

			var form = $(".lwa-form, #loginform");
			var user = form.find('input[name="log"]').val();
			var pass = form.find('input[name="pwd"]').val();

			var trying = user + pass;
			if (trying === redundant_looping_block) return true;
			redundant_looping_block = trying;

			api.login(user, pass).done(s => {
				dbg.login("login:",s);
				var login_button = $("#lwa_wp-submit, #wp-submit");
				if (s) login_button.click(); // resubmit event; which will just get to the jwt test.
			}, err => {
				console.error(err);
				if (err.body && err.body.message) return alert(err.body.message);
				try {
					if (err.request && err.request.conf && err.request.conf.body) {
						var parsed = JSON.parse(err.request.conf.body);
						if (parsed.password) parsed.password = '[REDACTED]';
						err.request.conf.body = parsed;
					}
				} catch (e) {
					console.error("redactor failed", e);
				}
				alert("FAIL: "+ JSON.stringify(err, null, 2));
			});
		} catch (err) {
			console.error(err);
			alert("FAIL: "+ JSON.stringify(err, null, 2));
		}
		return true; //block event
	}

	window.magic = {
		login: function() {
			switch (location.pathname) {
				case '/wp-login.php':
					switch (location.search) {
						case '?loggedout=true':
						case '':
							return dualSession();
					}
					return false;
			}
			return dualSession();
		},

		testSessionDesync: function(logout_button) {
			dbg.login("testSessionDesync:", logout_button.length);
			if (logout_button.length === 0) return;
			// if a user has a WP session but no API session, force the issue.
			var tokens = testSession();
			if (!tokens) return location = logout_button.attr('href');
		},

		bookme: function(gid, button) {
			dbg.booking({bstate: button.text(), booking: api.state.id, into: gid, button, auth: api.authorization});
			switch (button.text()) {
				case 'Cancel':
					return alert("you're already booked");

				case 'Book Now':
					button.text("Working...").disable();
					return api.bookings.bookMeIntoGame(gid).done(resp => {
						dbg.booking("booking:", resp);
						if (resp.code === 403 || resp.body.status === 'FAILURE') {
							button.text("Book Now").enable();
						} else {
							location.reload(true);
						}
						if (resp.body.message !== 'BOOKED') return alert(resp.body.message);
					});
			}
		}
	};
	function installButton() {
		// dbg.booking("installing button", api.state && api.state.fresh);
		if (api.state && api.state.fresh) {
			var legacy_bookme = $(".em-booking-button");
			var legacy_cancel = $(".em-cancel-button");

			if (legacy_bookme.length + legacy_cancel.length) return $("span.eventid").filter(function(i, e) {
				var $e = $(e);
				var gid = e.getAttribute('data-id');
				dbg.booking(JSON.stringify(api.state.my_events, null, 2));

				legacy_cancel.click(() => {
					console.log("user is cancelling", gid, api.state.id);
				});
				legacy_bookme.unbind("click").show();
				legacy_bookme.click(() => {
					console.log("user is booking", gid, api.state.id);
					magic.bookme(gid, legacy_bookme);
				});

				// dbg.booking({testing: gid, entry: api.state.my_events[gid], text});
			});
		}

		setTimeout(installButton, 100);
	}
	installButton();
})();

window.LIB_LOADING = window.LIB_LOADING || {};
window.LIB_LOADING['magic'] = true;
if (window.xander_shim_dbg) console.log("magic 2019-07-26");

