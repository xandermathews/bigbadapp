"use strict";

(function() {
	var redundant_looping_block = null; // paranoia about there being some browser bug that causes my "login, retry form submission" to go into an infinite loop.
	window.magic = {
		login: function() {
			try {
				var jwt = localStorage.getItem('Authorization');
				if (jwt) return false; // let wordpress get the event

				console.log("attempting to login");
				var form = $(".lwa-form, #loginform");
				var user = form.find('input[name="log"]').val();
				var pass = form.find('input[name="pwd"]').val();

				var trying = user + pass;
				if (trying === redundant_looping_block) return true;
				redundant_looping_block = trying;

				api.login(user, pass).done(s => {
					localStorage.setItem('Authorization', s);
					var login_button = $("#lwa_wp-submit, #wp-submit");
					if (s) login_button.click(); // resubmit event; which will just get to the jwt test.

				}, err => {
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
			// if a user has a WP session but no API session, force the issue.
			if (logout_button.length === 0) return;
			var jwt = localStorage.getItem('Authorization');
			if (jwt) return;

			if (!jwt) location = logout_button.attr('href');
		}
	};
})();
