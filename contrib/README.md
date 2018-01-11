#### Contribution Guide

### Summary

This project follows [Semantic Versioning 2.0](https://semver.org/). In general, every release is associated with a tag and a changelog. master serves as the mainline branch for the project and represent the latest state of development.

### Publishing a New SDK version (General)
```bash
# bump the version in package.json
npm version patch --no-git-tag-version

# do a fresh build of everything in dist/
npm run build

# create a commit + tag for this npm version
export PACKAGE_VERSION=`node -e 'console.log(require("./package.json").version)'`
git commit -a -m "Release $PACKAGE_VERSION"
LAST_VERSION=`git describe --tags $(git rev-list --tags --max-count=1)`
BODY=`git log --no-merges $LAST_VERSION..HEAD --pretty="format:%s (%h); %an"`
BODY="Changelog since $LAST_VERSION:
$BODY"
git tag -a "$PACKAGE_VERSION" -m "$BODY"

# make live
git push upstream && git push upstream --tags
npm publish

# Send an email detailing the changes to the stitch-users@mongodb.com mailing list.
```

### Patch Versions

The work for a patch version should happen on a "support branch" (e.g. 1.2.x). The purpose of this is to be able to support a minor release while excluding changes from the mainstream (master) branch. If the changes in the patch are relevant to other branches, including master, they should be backported there. The general publishing flow can be followed.

### Minor Versions

The general publishing flow can be followed except that `minor` should be used instead of `patch` in `npm version`.

### Major Versions

The general publishing flow can be followed except that `major` should be used instead of `patch` in `npm version`. In addition to this, the release on GitHub should be edited for a more readable format of key changes and include any migration steps needed to go from the last major version to this one.
