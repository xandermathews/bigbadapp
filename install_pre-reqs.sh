#!/bin/bash

warnings=0
if [[ -z "$JAVA_HOME" ]]; then
	echo warning: JAVA_HOME is not set
	if [[ -x /usr/libexec/java_home ]]; then
		echo /usr/libexec/java_home says you should have this in your .bashrc:
		echo export JAVA_HOME=$(/usr/libexec/java_home)
	else
		echo SEE ALSO https://stackoverflow.com/questions/1348842
	fi
	let ++warnings
fi
if [[ -z "$ANDROID_HOME" ]]; then
	echo warning: ANDROID_HOME is not set
	echo SEE ALSO https://stackoverflow.com/questions/19986214
	let ++warnings
elif ! [[ "$(which adb)" =~ Android/sdk/platform-tools/adb ]]; then
	echo warning: ADB sanity check failed, is Android/sdk/platform-tools in your path?
	let ++warnings
elif ! [[ "$(which lint)" =~ Android/sdk/tools/lint ]]; then
	echo warning: lint sanity check failed, is Android/sdk/tools in your path?
	let ++warnings
fi

if ((warnings)); then
	sleep 10
fi

install_all() {
	local CLILIST="$1" CLI
	for CLI in $CLILIST; do
		if which $CLI >/dev/null 2>&1 ;then
			echo pass: $CLI is already in path
			continue
		fi
		if ! inst_cli_$CLI ; then
			echo FAIL: installer for $CLI
			exit 1
		fi
	done
}

inst_cli_brew() {
	if [[ $OSTYPE =~ darwin ]]; then
		/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
	fi
}

inst_cli_gradle() {
	# https://gradle.org/install/
	if [[ $OSTYPE =~ darwin ]]; then
		brew install gradle
	else
		echo the bbc gradle installer currently only supports OSX. pester Xander to get your OS added, and in the meanwhile, you can install gradle: https://gradle.org/install/
		exit 1
	fi
}

inst_cli_cordova() {
	npm install -g cordova
}

inst_cli_yarn() {
	npm install -g yarn
}

inst_cli_ios-deploy() {
	npm install -g ios-deploy
}

inst_cli_rvm() { # https://rvm.io/rvm/install
	\curl -sSL https://get.rvm.io | bash -s stable --ruby
	# the above will modify your ~/.bash stuff, the below will activate it for the rest of this bash script
	. ~/.rvm/scripts/rvm

	# manual update step:
	# rvm get stable
}

inst_cli_pod() {
	# https://guides.cocoapods.org/using/getting-started.html#getting-started
	gem install cocoapods
	#TODO: configure .gitignore around pods if needed https://guides.cocoapods.org/using/using-cocoapods.html
	pod setup
}

# universally required:
install_all 'yarn brew cordova'

for arg; do
	case $arg in
		(ios)
			install_all 'ios-deploy rvm pod'
		;;
		(android)
			install_all 'gradle'
		;;
	esac
done
echo
