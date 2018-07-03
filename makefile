setup:
	./install_pre-reqs.sh ios android
	cordova requirements

build:
	cordova build

browser:
	# [[ -d platforms/browser/ ]] || cordova platform add browser --save
	[[ -d platforms/browser/ ]] || cordova prepare browser
	cordova run browser --device

android:
	./install_pre-reqs.sh android
	[[ -d platforms/android/ ]] || cordova prepare android
	cordova run android --device

ios:
	./install_pre-reqs.sh ios
	[[ -d platforms/ios/ ]] || cordova prepare ios
	cordova run ios --device --buildFlag="DEVELOPMENT_TEAM=RU2387524S"

xcode:
	open platforms/ios/BigBadApp.xcworkspace

# this is for unwedging platform includes, which I needed when I moved the local copy of the project around.
remove:
	cordova platform rm ios
	cordova platform rm android
	cordova platform rm browser

add:
	cordova platform add ios --save
	cordova platform add android --save
	cordova platform add browser --save

# I don't like using git clean's nukes; I prefer having a whitelist of things I'm lighting on fire
# git status should be empty if the whitelist contains everything
dist-nuke:
	rm -rf node_modules/ platforms/ plugins/
	git status --ignored
