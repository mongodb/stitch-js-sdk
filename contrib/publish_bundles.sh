#!/bin/sh

set -e

VERSION=`node -e 'console.log(require("../lerna.json").version)'` 
VERSION_MAJOR=$(echo $VERSION | cut -d. -f1)
VERSION_MINOR=$(echo $VERSION | cut -d. -f2)
VERSION_PATCH=$(echo $VERSION | cut -d. -f3 | cut -d- -f1)
VERSION_QUALIFIER=$(echo $VERSION | cut -d- -f2)
VERSION_QUALIFIER_INC=$(echo $VERSION | cut -d- -f3)

lerna run build

if ! which aws; then
   echo "aws CLI not found. see: https://docs.aws.amazon.com/cli/latest/userguide/installing.html"
   exit 1
fi

PACKAGES=(
	"core"
	"sdk"
	"services/aws-s3"
	"services/aws-ses"
	"services/http"
	"services/mongodb-remote"
	"services/twilio"
)

for package in "${PACKAGES[@]}"
do
	path_loc=../packages/browser/$package/dist/browser
	if [ -z "$VERSION_QUALIFIER" ]; then
		# Publish to MAJOR, MAJOR.MINOR
		aws s3 cp $path_loc s3://stitch-sdks/js/bundles/$VERSION_MAJOR --exclude "*" --include "stitch*.js" --include "stitch*.map" --recursive --acl public-read
		aws s3 cp $path_loc s3://stitch-sdks/js/bundles/$VERSION_MAJOR.$VERSION_MINOR --exclude "*" --include "stitch*.js" --include "stitch*.map" --recursive --acl public-read
	fi

	# Publish to full version
	aws s3 cp $path_loc s3://stitch-sdks/js/bundles/$VERSION --exclude "*" --include "stitch*.js" --include "stitch*.map" --recursive --acl public-read

	BRANCH_NAME=`git branch | grep -e "^*" | cut -d' ' -f 2`
	aws s3 cp $path_loc s3://stitch-sdks/js/bundles/branch/$BRANCH_NAME --exclude "*" --include "stitch*.js" --include "stitch*.map" --recursive --acl public-read
done
