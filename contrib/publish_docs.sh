#!/bin/sh

set -e

cd "$(dirname "$0")"

VERSION=`node -e 'console.log(require("../lerna.json").version)'` 
VERSION_MAJOR=$(echo $VERSION | cut -d. -f1)
VERSION_MINOR=$(echo $VERSION | cut -d. -f2)
VERSION_PATCH=$(echo $VERSION | cut -d. -f3 | cut -d- -f1)
VERSION_QUALIFIER=$(echo $VERSION | cut -d- -f2 -s)
VERSION_QUALIFIER_INC=$(echo $VERSION | cut -d- -f3 -s)

# Validate the docs code examples. If something broke, please alert @docs-stitch-team.
./docs-examples/validate_all.sh

# Generate the docs with the analytics script enabled.
./generate_docs.sh browser analytics
./generate_docs.sh server analytics
./generate_docs.sh react-native analytics

if ! which aws; then
  echo "aws CLI not found. see: https://docs.aws.amazon.com/cli/latest/userguide/installing.html"
  exit 1
fi

if [ -z "$VERSION_QUALIFIER" ]; then
	# Publish to MAJOR, MAJOR.MINOR
	aws s3 cp ../docs-browser s3://stitch-sdks/stitch-sdks/js/$VERSION_MAJOR --recursive --acl public-read
	aws s3 cp ../docs-browser s3://stitch-sdks/stitch-sdks/js/$VERSION_MAJOR.$VERSION_MINOR --recursive --acl public-read
	aws s3 cp ../docs-server s3://stitch-sdks/stitch-sdks/js-server/$VERSION_MAJOR --recursive --acl public-read
	aws s3 cp ../docs-server s3://stitch-sdks/stitch-sdks/js-server/$VERSION_MAJOR.$VERSION_MINOR --recursive --acl public-read
	aws s3 cp ../docs-react-native s3://stitch-sdks/stitch-sdks/js-react-native/$VERSION_MAJOR --recursive --acl public-read
	aws s3 cp ../docs-react-native s3://stitch-sdks/stitch-sdks/js-react-native/$VERSION_MAJOR.$VERSION_MINOR --recursive --acl public-read
fi

# Publish to full version
aws s3 cp ../docs-browser s3://stitch-sdks/stitch-sdks/js/$VERSION --recursive --acl public-read
aws s3 cp ../docs-server s3://stitch-sdks/stitch-sdks/js-server/$VERSION --recursive --acl public-read
aws s3 cp ../docs-react-native s3://stitch-sdks/stitch-sdks/js-react-native/$VERSION --recursive --acl public-read

BRANCH_NAME=`git branch | grep -e "^*" | cut -d' ' -f 2`
aws s3 cp ../docs-browser s3://stitch-sdks/stitch-sdks/js/branch/$BRANCH_NAME --recursive --acl public-read
aws s3 cp ../docs-server s3://stitch-sdks/stitch-sdks/js-server/branch/$BRANCH_NAME --recursive --acl public-read
aws s3 cp ../docs-react-native s3://stitch-sdks/stitch-sdks/js-react-native/branch/$BRANCH_NAME --recursive --acl public-read
