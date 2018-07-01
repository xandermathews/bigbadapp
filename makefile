setup:
	./install_pre-reqs.sh ios android
	cordova requirements

build:
	cordova build

browser:
	[[ -d platforms/browser/ ]] || cordova platform add browser --save
	#cordova build browser
	cordova run browser --device

android:
	cordova build android
	cordova run android --device

ios:
	cordova build ios
	cordova run ios --device


# this is for unwedging platform includes, which I needed when I moved the local copy of the project around.
remove:
	cordova platform rm ios
	cordova platform rm android
	cordova platform rm browser

add:
	cordova platform add ios --save
	cordova platform add android --save
	cordova platform add browser --save

dist-nuke:
	# I don't like using git clean's nukes; I prefer having a whitelist of things I'm lighting on fire:
	rm -rf node_modules/ platforms/ plugins/
	# this should be empty if the whitelist contains everything:
	git status --ignored
