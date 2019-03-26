#!/bin/bash

cd "$(dirname "$0")"

# Paste the version string into the README.
VERSION=`node -e 'console.log(require("../lerna.json").version)'` 
VERSION_MAJOR=$(echo $VERSION | cut -d. -f1)
VERSION_MINOR=$(echo $VERSION | cut -d. -f2)
VERSION_PATCH=$(echo $VERSION | cut -d. -f3 | cut -d- -f1)

echo "Setting README version to $VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH..."

# Replace the occurences of stitch-sdks/js/bundles/<SOME VERSION>/stitch
# with stitch-sdks/js/bundles/<CURRENT VERSION>/stitch
sed -i '' \
  -e "s#\(stitch-sdks/js/bundles/\)[0-9\.]*\(/stitch\)#\1$VERSION_MAJOR.$VERSION_MINOR.$VERSION_PATCH\2#g" \
  ../packages/browser/sdk/README.md
echo "README updated. Remember to commit the change before publishing!"
