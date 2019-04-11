#!/bin/sh

set -e

# Let this be run from any directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
cd ..

JIRA_TICKET=$1
if [ -z "$JIRA_TICKET" ]
    then
        echo $"Usage: must provide Jira ticket number (Ex: STITCH-1234, or 1234)"
        exit 1
fi

 if [[ $JIRA_TICKET != *"-"* ]] ; then
    JIRA_TICKET="STITCH-$JIRA_TICKET"
fi
echo "Jira Ticket: $JIRA_TICKET"

git checkout -b "Release-$JIRA_TICKET"
git push -u origin "Release-$JIRA_TICKET"

lerna version -m "$JIRA_TICKET Release %s" --force-publish="*"  

echo "creating pull request in github..."
hub pull-request -m "$JIRA_TICKET: Release $NEW_VERSION" --base mongodb:master --head mongodb:"Release-$JIRA_TICKET"
