now: full

fast:
	rsync2 magic.js l:~/js/

medium: fast
	rsync2 api.js l:/home/web/www.logictwine.com/repositories/github/wp-content/themes/atahualpa/plugins/xandermagic-libraries

full: preppolyfill
	rsync2 magic.js shim.js l:~/js/
	rsync2 ~/boast/fetch-api.js api.js gen.js ../js-vendor/ l:/home/web/www.logictwine.com/repositories/github/wp-content/themes/atahualpa/plugins/xandermagic-libraries
	ssh l 'cat login-with-ajax/login-with-ajax.js.orig js/shim.js > login-with-ajax/login-with-ajax.js; rm js/shim.js'

preppolyfill:
	cat ../../node_modules/whatwg-fetch/fetch.js > ../js-vendor/fetch-polyfill.js
	cat ../js-vendor/fetch-polyfill.footer      >> ../js-vendor/fetch-polyfill.js
