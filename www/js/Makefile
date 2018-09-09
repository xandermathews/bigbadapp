local: polyfill shim
	rsync2 magic.js fetch-api.js api.js gen.js ../js-vendor/ ~/big-bad-con-site/wp-content/themes/atahualpa/plugins/login-with-ajax
	rsync -rP ~/big-bad-con-site/wp-content/themes/atahualpa/plugins/login-with-ajax/ l:/home/web/www.logictwine.com/repositories/github/wp-content/themes/atahualpa/plugins/login-with-ajax

../js-vendor/fetch-polyfill.js: ../../node_modules/whatwg-fetch/fetch.js ../js-vendor/fetch-polyfill.footer
	cat ../../node_modules/whatwg-fetch/fetch.js > ../js-vendor/fetch-polyfill.js
	cat ../js-vendor/fetch-polyfill.footer      >> ../js-vendor/fetch-polyfill.js

~/big-bad-con-site/wp-content/themes/atahualpa/plugins/login-with-ajax/login-with-ajax.js: shim.js
	cat ~/big-bad-con-site/wp-content/themes/atahualpa/plugins/login-with-ajax/login-with-ajax.js.orig shim.js > ~/big-bad-con-site/wp-content/themes/atahualpa/plugins/login-with-ajax/login-with-ajax.js

shim: ~/big-bad-con-site/wp-content/themes/atahualpa/plugins/login-with-ajax/login-with-ajax.js

polyfill: ../js-vendor/fetch-polyfill.js
