#!/bin/bash -e
# Copyright 2018 Alexander Mathews xander@ashnazg.com
# Permission is hereby granted, free of charge, to any person obtaining a copy of
# this software and associated documentation files (the "Software"), to deal in the
# Software without restriction, including without limitation the rights to use, copy,
# modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
# and to permit persons to whom the Software is furnished to do so, subject to the
# following conditions:

# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
# FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
# COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
# AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# script v4

NODE_VERSION=8.11.3
NVM_VERSION=0.33.2 # see https://github.com/creationix/nvm
LTS=1

export NVM_DIR=${NVM_DIR:-~/.nvm}

die() {
	echo "FAIL: $@"
	exit 1
}

if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
	touch ~/.bashrc
	curl -o- https://raw.githubusercontent.com/creationix/nvm/v$NVM_VERSION/install.sh | bash
fi

. "$NVM_DIR/nvm.sh"

type nvm >/dev/null 2>/dev/null || die NVM did not initialize

if ! [[ $(node --version 2>/dev/null) =~ $NODE_VERSION ]]; then
	if ((LTS)); then
		nvm install --lts || die LTS install
		nvm use --lts || die LTS selection
		nvm alias default stable || die setting default to LTS
	else
		nvm install $NODE_VERSION || die installing node $NODE_VERSION
		nvm use $NODE_VERSION || die selecting node $NODE_VERSION
		nvm alias default $NODE_VERSION || die setting default to $NODE_VERSION
	fi
	node --version
fi

if ! which yarn >/dev/null; then
	npm install -g yarn || die could not install yarn
fi

yarn || die could not run yarn

ifyarn() {
	local arg
	for arg; do
		if ! which $arg >/dev/null; then
			yarn global remove $arg || true
			yarn global add $arg || die could not yarn-install $arg
			which $arg >/dev/null # bail if this didn't work
		fi
	done
}
ifyarn nodemon
