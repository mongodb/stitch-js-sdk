#!/bin/sh

set -ex

pushd "$(dirname "$0")"

USER=`whoami`

# Validate the docs code examples. If something broke, please alert @docs-stitch-team.
./docs-examples/validate_all.sh

./generate_docs.sh browser analytics
./generate_docs.sh server analytics
./generate_docs.sh react-native analytics

if ! which aws; then
    echo "aws CLI not found. see: https://docs.aws.amazon.com/cli/latest/userguide/installing.html"
    popd > /dev/null
    exit 1
fi

BRANCH_NAME=`git branch | grep -e "^*" | cut -d' ' -f 2`

USER_BRANCH="${USER}/${BRANCH_NAME}"

aws s3 --profile 10gen-noc cp ../docs-browser s3://docs-mongodb-org-staging/stitch/"$USER_BRANCH"/sdk/js/ --recursive --acl public-read
aws s3 --profile 10gen-noc cp ../docs-server s3://docs-mongodb-org-staging/stitch/"$USER_BRANCH"/sdk/js-server/ --recursive --acl public-read
aws s3 --profile 10gen-noc cp ../docs-react-native s3://docs-mongodb-org-staging/stitch/"$USER_BRANCH"/sdk/react-native/ --recursive --acl public-read

echo
echo "Staged URLs:"
echo "  https://docs-mongodbcom-staging.corp.mongodb.com/stitch/$USER_BRANCH/sdk/js/index.html"
echo "  https://docs-mongodbcom-staging.corp.mongodb.com/stitch/$USER_BRANCH/sdk/js-server/index.html"
echo "  https://docs-mongodbcom-staging.corp.mongodb.com/stitch/$USER_BRANCH/sdk/react-native/index.html"

popd > /dev/null
