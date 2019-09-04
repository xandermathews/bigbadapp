jQuery(document).ready(function(a){function e(e,i){a(".lwa-loading").remove(),i=a(i),e.result===!0?i.attr("class","lwa-status lwa-status-confirm").html(e.message):e.result===!1?(i.attr("class","lwa-status lwa-status-invalid").html(e.error),i.find("a").click(function(e){var i=a(this).parents(".lwa").find("form.lwa-remember");i.length>0&&(e.preventDefault(),i.show("slow"))})):i.attr("class","lwa-status lwa-status-invalid").html("An error has occured. Please try again.")}a("#LoginWithAjax").length>0&&(a("#LoginWithAjax").addClass("lwa"),a("#LoginWithAjax_Status").addClass("lwa-status"),a("#LoginWithAjax_Register").addClass("lwa-register"),a("#LoginWithAjax_Remember").addClass("lwa-remember"),a("#LoginWithAjax_Links_Remember").addClass("lwa-links-remember"),a("#LoginWithAjax_Links_Remember_Cancel").addClass("lwa-links-remember-cancel"),a("#LoginWithAjax_Form").addClass("lwa-form")),a("form.lwa-form, form.lwa-remember, div.lwa-register form").submit(function(i){i.preventDefault();var n=a(this),t=n.find(".lwa-status");0==t.length&&(t=a('<span class="lwa-status"></span>'),n.prepend(t));var l=n.find(".lwa-ajax");0==l.length&&(l=a('<input class="lwa-ajax" name="lwa" type="hidden" value="1" />'),n.prepend(l)),a('<div class="lwa-loading"></div>').prependTo(n);var s=n.attr("action");"undefined"!=typeof LWA&&(s=LWA.ajaxurl),a.ajax({type:"POST",url:s,data:n.serialize(),success:function(i){e(i,t),a(document).trigger("lwa_"+i.action,[i,n])},error:function(){e({},t)},dataType:"jsonp"})}),a(document).on("lwa_login",function(e,i,n){i.result===!0&&(null!=i.widget?a.get(i.widget,function(e){var i=a(e);n.parent(".lwa").replaceWith(i);var t=i.find(".").show(),l=i.parent().find(".lwa-title");l.replaceWith(t)}):null==i.redirect?window.location.reload():window.location=i.redirect)}),a(".lwa-modal").each(function(e,i){var n=a(i);n.parents(".lwa").data("modal",n),a("body").append(a('<div class="lwa"></div>').append(n))}),a(document).on("click",".lwa-links-modal",function(e){var i=a(this).parents(".lwa").data("modal");"undefined"!=typeof i&&i.length>0&&(e.preventDefault(),i.reveal({modalbgclass:"lwa-modal-bg",dismissmodalclass:"lwa-modal-close"}))}),a(".lwa-links-register-inline").click(function(e){var i=a(this).parents(".lwa").find(".lwa-register");i.length>0&&(e.preventDefault(),i.show("slow"),a(this).parents(".lwa").find(".lwa-remember").hide("slow"))}),a(".lwa-links-register-inline-cancel").click(function(e){e.preventDefault(),a(this).parents(".lwa-register").hide("slow")}),a(document).on("click",".lwa-links-remember",function(e){var i=a(this).parents(".lwa").find(".lwa-remember");i.length>0&&(e.preventDefault(),i.show("slow"),a(this).parents(".lwa").find(".lwa-register").hide("slow"))}),a(document).on("click",".lwa-links-remember-cancel",function(e){e.preventDefault(),a(this).parents(".lwa-remember").hide("slow")})}),function(a){a("a[data-reveal-id]").on("click",function(e){e.preventDefault();var i=a(this).attr("data-reveal-id");a("#"+i).reveal(a(this).data())}),a.fn.reveal=function(e){var i={animation:"fadeAndPop",animationspeed:300,closeonbackgroundclick:!0,dismissmodalclass:"close-reveal-modal",modalbgclass:"reveal-modal-bg"},e=a.extend({},i,e);return this.each(function(){function i(){o=!1}function n(){o=!0}var t=a(this),l=parseInt(t.css("top")),s=t.height()+l,o=!1,d=a("."+e.modalbgclass);0==d.length&&(d=a('<div class="'+e.modalbgclass+'" />').insertAfter(t)),0==t.find("."+e.dismissmodalclass).length&&t.append('<a class="'+e.dismissmodalclass+'">&#215;</a>'),t.bind("reveal:open",function(){d.unbind("click.modalEvent"),a("."+e.dismissmodalclass).unbind("click.modalEvent"),o||(n(),"fadeAndPop"==e.animation&&(t.css({top:a(document).scrollTop()-s,opacity:0,visibility:"visible",display:"block"}),d.fadeIn(e.animationspeed/2),t.delay(e.animationspeed/2).animate({top:a(document).scrollTop()+l+"px",opacity:1},e.animationspeed,i())),"fade"==e.animation&&(t.css({opacity:0,visibility:"visible",top:a(document).scrollTop()+l,display:"block"}),d.fadeIn(e.animationspeed/2),t.delay(e.animationspeed/2).animate({opacity:1},e.animationspeed,i())),"none"==e.animation&&(t.css({visibility:"visible",top:a(document).scrollTop()+l,display:"block"}),d.css({display:"block"}),i())),t.unbind("reveal:open")}),t.bind("reveal:close",function(){o||(n(),"fadeAndPop"==e.animation&&(d.delay(e.animationspeed).fadeOut(e.animationspeed),t.animate({top:a(document).scrollTop()-s+"px",opacity:0},e.animationspeed/2,function(){t.css({top:l,opacity:1,visibility:"hidden"}),i()})),"fade"==e.animation&&(d.delay(e.animationspeed).fadeOut(e.animationspeed),t.animate({opacity:0},e.animationspeed,function(){t.css({opacity:1,visibility:"hidden",top:l}),i()})),"none"==e.animation&&(t.css({visibility:"hidden",top:l}),d.css({display:"none"}))),t.unbind("reveal:close")}),t.trigger("reveal:open");a("."+e.dismissmodalclass).bind("click.modalEvent",function(){t.trigger("reveal:close")});e.closeonbackgroundclick&&(d.css({cursor:"pointer"}),d.bind("click.modalEvent",function(){t.trigger("reveal:close")})),a("body").keyup(function(a){27===a.which&&t.trigger("reveal:close")})})}}(jQuery);
(function() {
	"use strict";
	// true disables all xander magic (other than a one line css fix, since the css isn't dynamic.)
	// false enables ajax-everything.
	var SAFETY = false;

	if (SAFETY) {
		function enableLegacy() {
			var legacy_bookme = jQuery(".em-booking-button");
			if (legacy_bookme.length) return legacy_bookme.show();
			setTimeout(enableLegacy, 100);
		}
		return enableLegacy();
	}
	var absurl;
	function deathRattle(msg, line, col) {
		if (line) msg += ' line '+line;
		if (col) msg += ' col '+col;
		alert(absurl + " did not complete, try reloading the page or contacting tech support and showing them this error\n" + msg);
	}

	window.onerror = function(msg, url, line, col, error) {
		console.log({OLD: msg, url, line, col, error, absurl});
		if (absurl === url) deathRattle(msg, line, col);
	}
	/* nobody's using the above hook, so I don't have to feel bad for using it.
	console.log({olderr: window.onerror});
	window.addEventListener('error', function(err) {
		console.log(err);
	}, false);
	*/

	var dbg_shim = 0;
	window.xander_shim_dbg = dbg_shim;
	window.$ = jQuery;
	var lib = '/wp-content/themes/atahualpa/plugins/xandermagic-libraries-2019-07-26/';
	if (true || localStorage && localStorage.getItem('dbg') === 'xander') {
		lib = '/wp-content/themes/atahualpa/plugins/xandermagic-libraries-2019-08-28/';
		console.log("version 2019-08-28 deployed");
	}

	$("body").ajaxError(function(e, jqxhr, settings, exception) {
		console.error({e, settings, exception, jqxhr});
	});
	function run(urls, then) {
		if (urls.length) {
			var url = urls.shift();
			absurl = location.protocol + '//' + location.hostname + url;
			var stem = url.replace(/^.*\//, '').replace(/\.js$/, '');
			if (dbg_shim) console.log("loading", url, stem);
			var script = document.createElement('script');
			script.setAttribute('src', url);
			window.LIB_LOADING = window.LIB_LOADING || {};
			script.onload = function() {
				setTimeout(() => {
					if (!window.LIB_LOADING[stem]) deathRattle(stem +' did not init');
					else return run(urls, then);
				}, 1);
			}
			script.onerror = function() {
				// this triggers on network errors, but not on parse errors.
				console.error(url + " had error", arguments);
			};
			document.body.appendChild(script);
		} else {
			if (then) then();
		}
	}

	function init() {
		var logout_button = $("#wp-logout");
		var login_button = $("#lwa_wp-submit, #wp-submit");
		if (logout_button.length + login_button.length === 0) return setTimeout(init, 100);

		login_button.click(function(ev) {
			if (dbg_shim) console.log("login attempted");
			if (magic.login()) {
				console.log("magic said bail");
				ev.preventDefault();
				ev.stopImmediatePropagation();
				return false;
			}
			console.log("magic said ok");
		});

		logout_button.click(function(ev) {
			localStorage.removeItem('Authorization');
			if (dbg_shim) console.log("CLICKED");
			// var url = $(this).attr('href');
			// location = url;

			// event.preventDefault();
			// event.stopImmediatePropagation();
			// return false;
		});

		run([
			lib+'q.js',
			lib+"fetch-api.js",
			lib+'gen.js',
			lib+'api.js',
			lib+'magic.js'
		], function() {
			if (dbg_shim) console.log("all shims loaded");
			magic.testSessionDesync(logout_button);
			if (location.host !== 'www.logictwine.com') return; // in prod, none of the rest is needed
			return gen('button', {
				text: 'run patcher',
				style: "position: fixed; top: 50px; opacity: .2; z-index: 10",
				click: function() {
					run([
						lib+"fetch-api.js",
						lib+'gen.js',
						lib+'api.js',
						lib+'magic.js'
					]);
				}
			}, document.body);
		});
	}
	init();
})();
