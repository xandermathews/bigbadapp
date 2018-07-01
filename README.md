# Dev Setup
The makefile will auto install (as needed):
1. nvm/npm/yarn/nodejs
1. brew (if on OSX)
1. android stuff:
	1. gradle
1. ios stuff:
	1. ios-deploy (an npm package)
	1. ruby/rvm/cocopods

# Troubleshooting (tentative iOS fix)
if build fails with:

```
Signing for "BigBadApp" requires a development team. Select a development team in the project editor.
Code signing is required for product type 'Application' in SDK 'iOS 10.2'
```

then ```open platforms/ios/BigBadApp.xcodeproj``` and follow [this stackoverflow](https://stackoverflow.com/a/41217410/171105)
