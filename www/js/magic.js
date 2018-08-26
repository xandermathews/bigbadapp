(function() {
	"use strict";
	var dbg_booking = 0;
	var dbg_login = 0;
	var redundant_looping_block = null; // paranoia about there being some browser bug that causes my "login, retry form submission" to go into an infinite loop.

	function testSession() {
		var jwt = localStorage.getItem('Authorization');
		var uid = localStorage.getItem('state');
		if (jwt && uid && uid !== 'undefined') return {jwt, uid};
		return null;
	}

	window.magic = {
		login: function() {
			try {
				if (testSession()) return false; // let wordpress get the event

				var form = $(".lwa-form, #loginform");
				var user = form.find('input[name="log"]').val();
				var pass = form.find('input[name="pwd"]').val();

				var trying = user + pass;
				if (trying === redundant_looping_block) return true;
				redundant_looping_block = trying;

				api.login(user, pass).done(s => {
					if (dbg_login) console.log("login:",s);
					var login_button = $("#lwa_wp-submit, #wp-submit");
					if (s) login_button.click(); // resubmit event; which will just get to the jwt test.
				}, err => {
					console.error(err);
					if (err.body && err.body.message) alert(err.body.message);
					else alert("FAIL: "+ JSON.stringify(err, null, 2));
				});
			} catch (err) {
				console.error(err);
				alert("FAIL: "+ JSON.stringify(err, null, 2));
			}
			return true; //block event
		},

		testSessionDesync: function(logout_button) {
			if (dbg_login) console.log("testSessionDesync:", logout_button.length);
			if (logout_button.length === 0) return;
			// if a user has a WP session but no API session, force the issue.
			var tokens = testSession();
			if (!tokens) return location = logout_button.attr('href');
		},

		bookme: function(gid, button) {
			if (dbg_booking) console.log({booking: api.state.id, into: gid, button, auth: api.authorization});
			if (api.state.my_events[gid]) {
			}
			button.text("Working...").disable();
			api.bookings.bookMeIntoGame(gid).done(resp => {
				if (dbg_booking) console.log("booking:", resp);
				if (resp.code === 403 || resp.body.status === 'FAILURE') {
					button.text("Book Me").enable();
				} else {
					button.text("Leave Game")//.enable();
				}
				return alert(resp.body.message);
			});
		}
	};
	var test = /^Event ID ([0-9]+)$/;
	function installButton() {
		if (api.state && api.state.fresh) return $("p").filter(function(i, e) {
			var $e = $(e);
			var t = $e.text();
			var matches = t.match(test);
			if (matches) {
				var gid = matches[1];
				if (dbg_booking) console.log(JSON.stringify(api.state.my_events, null, 2));
				var text = "Book Me";
				var already = false;
				if (api.state.my_events[gid]) {
					text = 'Leave Game';
					already = true;
				}
				text += ' ' + gid;
				if (dbg_booking) console.log({testing: gid, entry: api.state.my_events[gid], text});
				var button;
				$e.replaceWith(button = gen('button.bookme', {
					text,
					click() {
						magic.bookme(gid, $(this));
					}
				}));
				if (already) button.disable();
			}
		});

		setTimeout(installButton, 100);
	}
	installButton();
	// console.log("magic.js loaded", {location});
})();
