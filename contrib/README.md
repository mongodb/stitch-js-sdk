# Contribution Guide

## Summary

This project follows [Semantic Versioning 2.0](https://semver.org/). In general, every release is associated with a tag and a changelog. `support/3.x` serves as the mainline branch for the project and represents the latest state of development.

## Publishing a New SDK version

```bash
# fetch and rebase from upstream/support/3.x
git fetch upstream support/3.x
git rebase upstream/support/3.x

# checkout a release branch
git checkout -b release/3.<x>.<y>

# run bump_version.bash with either patch, minor, or major
./bump_version.bash <patch|minor|major>

# push changes to your remote origin
git push origin release/3.<x>.<y>

# open a PR from that remote branch to support/3.x and get it reviewed
# merge branch after approval

# make live
git push upstream --tags
npm publish

npm deprecate mongodb-stitch "The browser SDK has moved to mongodb-stitch-browser-sdk, and the Node.js SDK has moved to mongodb-stitch-server-sdk"
```

## Patch Versions

The work for a patch version should happen on a "support branch" (e.g. 1.2.x). The purpose of this is to be able to support a minor release while excluding changes from the mainstream (`master`) branch. If the changes in the patch are relevant to other branches, including `master`, they should be backported there. The general publishing flow can be followed using `patch` as the bump type in `bump_version`.

## Minor Versions

The general publishing flow can be followed using `minor` as the bump type in `bump_version`.

## Major Versions

The general publishing flow can be followed using `major` as the bump type in `bump_version`. In addition to this, the release on GitHub should be edited for a more readable format of key changes and include any migration steps needed to go from the last major version to this one.
