#!/bin/sh

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
cd ..

BUMP_TYPE=$1
if [ "$BUMP_TYPE" != "patch" ] && [ "$BUMP_TYPE" != "minor" ] && [ "$BUMP_TYPE" != "major" ]; then
	echo $"Usage: $0 <patch|minor|major>"
	exit 1
fi

LAST_VERSION=`node -e 'console.log(require("./package.json").version)'`

npm version $BUMP_TYPE --no-git-tag-version

NEW_VERSION=`node -e 'console.log(require("./package.json").version)'`

echo "Bumping $LAST_VERSION to $NEW_VERSION ($BUMP_TYPE)"

# do a fresh build of everything in dist/
npm run build

git add package.json dist
git commit -m "Release $NEW_VERSION"
BODY=`git log --no-merges v$LAST_VERSION..HEAD --pretty="format:%s (%h); %an"`
BODY="Changelog since $LAST_VERSION:
$BODY"
git tag -a v"$NEW_VERSION" -m "$BODY"
