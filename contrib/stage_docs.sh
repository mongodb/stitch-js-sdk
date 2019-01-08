#!/bin/sh

set -ex

USER=`whoami`

npm run docs

if ! which aws; then
    echo "aws CLI not found. see: https://docs.aws.amazon.com/cli/latest/userguide/installing.html"
    exit 1
fi

BRANCH_NAME=`git branch | grep -e "^*" | cut -d' ' -f 2`

USER_BRANCH="${USER}/${BRANCH_NAME}"

aws s3 cp ../docs-browser s3://docs-mongodb-org-staging/stitch/"$USER_BRANCH"/sdk/js/ --recursive --acl public-read
aws s3 cp ../docs-server s3://docs-mongodb-org-staging/stitch/"$USER_BRANCH"/sdk/js-server/ --recursive --acl public-read
aws s3 cp ../docs-react-native s3://docs-mongodb-org-staging/stitch/"$USER_BRANCH"/sdk/react-native/ --recursive --acl public-read

echo
echo "Staged URLs:"
echo "  https://docs-mongodbcom-staging.corp.mongodb.com/stitch/$USER_BRANCH/sdk/js/index.html"
echo "  https://docs-mongodbcom-staging.corp.mongodb.com/stitch/$USER_BRANCH/sdk/js-server/index.html"
echo "  https://docs-mongodbcom-staging.corp.mongodb.com/stitch/$USER_BRANCH/sdk/react-native/index.html"
