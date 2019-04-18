#!/bin/sh

set -e

# Let this be run from any directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
cd ..

# Ensure that 'hub',  and 'lerna' are globally installed
which hub || (echo "hub is not installed. Please see contrib/README.md for more info" && exit 1)
which lerna || (echo "lerna is not globally installed. Please see contrib/README.md for more info" && exit 1)
LERNA_VERSION=`lerna -v`
LERNA_MAJOR_VERSION=$(echo $LERNA_VERSION | cut -d. -f1)
LERNA_MINOR_VERSION=$(echo $LERNA_VERSION | cut -d. -f2)

if [ $LERNA_MAJOR_VERSION -lt 3 ]; then
    echo "Must use lerna 3.13.+, found `lerna -v`"
    exit 1

elif [ $LERNA_MAJOR_VERSION -eq 3 ] && [ $LERNA_MINOR_VERSION -lt 13 ]; then
    echo "Must use lerna 3.13.+, found `lerna -v`"
    exit 1
fi

# Ensure that there are no working changes that will accidentally get committed.
STATUS="$(git status -s)"
if [ -n "$STATUS" ]; then
  echo "Git status is not clean. Refusing to commit."
  echo "Finish your work, then run $0"
  exit 1
fi

# Determine the bump type from the user input
BUMP_TYPE=$1
if [ "$BUMP_TYPE" != "patch" ] && [ "$BUMP_TYPE" != "minor" ] && [ "$BUMP_TYPE" != "major" ]; then
	echo $"Usage: $0 <patch|minor|major> <jira-ticket>"
	exit 1
fi

LAST_VERSION=`node -e 'console.log(require("./lerna.json").version)'` 
LAST_VERSION_MAJOR=$(echo $LAST_VERSION | cut -d. -f1)
LAST_VERSION_MINOR=$(echo $LAST_VERSION | cut -d. -f2)
LAST_VERSION_PATCH=$(echo $LAST_VERSION | cut -d. -f3 | cut -d- -f1)

# Construct the new package version
NEW_VERSION_MAJOR=$LAST_VERSION_MAJOR
NEW_VERSION_MINOR=$LAST_VERSION_MINOR
NEW_VERSION_PATCH=$LAST_VERSION_PATCH

if [ "$BUMP_TYPE" == "patch" ]; then
	NEW_VERSION_PATCH=$(($LAST_VERSION_PATCH+1))
elif [ "$BUMP_TYPE" == "minor" ]; then
	NEW_VERSION_MINOR=$(($LAST_VERSION_MINOR+1))
	NEW_VERSION_PATCH=0
else
	NEW_VERSION_MAJOR=$(($LAST_VERSION_MAJOR+1))
	NEW_VERSION_MINOR=0
	NEW_VERSION_PATCH=0
fi

NEW_VERSION=$NEW_VERSION_MAJOR.$NEW_VERSION_MINOR.$NEW_VERSION_PATCH

# Determine the JIRA ticket to include in the commit message for the pull request
JIRA_TICKET=$2
if [ -z "$JIRA_TICKET" ]
    then
        echo $"Usage: must provide Jira ticket number (Ex: STITCH-1234, or 1234)"
        exit 1
fi

 if [[ $JIRA_TICKET != *"-"* ]] ; then
    JIRA_TICKET="STITCH-$JIRA_TICKET"
fi
echo "Jira Ticket: $JIRA_TICKET"

# Create the branch for the release PR
git checkout -b "Release-$JIRA_TICKET"
git push -u upstream "Release-$JIRA_TICKET"

# Update the README to refer to the new version
echo "Setting README version to $NEW_VERSION_MAJOR.$NEW_VERSION_MINOR.$NEW_VERSION_PATCH..."

# Replace the occurences of stitch-sdks/js/bundles/<SOME VERSION>/stitch
# with stitch-sdks/js/bundles/<CURRENT VERSION>/stitch
sed -i '' \
  -e "s#\(stitch-sdks/js/bundles/\)[0-9\.]*\(/stitch\)#\1$NEW_VERSION_MAJOR.$NEW_VERSION_MINOR.$NEW_VERSION_PATCH\2#g" \
  packages/browser/sdk/README.md

git add -u "packages/browser/sdk/README.md"
git commit -m "$JIRA_TICKET Update browser README SDK version to $NEW_VERSION"

lerna version $BUMP_TYPE -m "$JIRA_TICKET Release %s" --force-publish="*"  

echo "creating pull request in github..."
hub pull-request -m "$JIRA_TICKET: Release $NEW_VERSION" --base mongodb:master --head mongodb:"Release-$JIRA_TICKET"
