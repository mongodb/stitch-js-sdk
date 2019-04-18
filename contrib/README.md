#### Contribution Guide

### Summary

This project follows [Semantic Versioning 2.0](https://semver.org/). In general, every release is associated with a tag and a changelog. `master` serves as the mainline branch for the project and represent the latest state of development.

### Developing

This project uses Lerna to manage multiple modules: https://github.com/lerna/lerna.
Run the following to begin development:
```bash
# install lerna globally
npm install --global lerna
# install dependencies
npm install
# install typedoc theme dependencies
cd typedoc-theme && npm install && cd ..
# install external dependencies, and link shared modules
lerna bootstrap --hoist
# build modules
lerna run build
```

New modules must be added to the `packages` directory, and `lerna bootstrap` must be ran again.

### Testing

To run tests, run:
```bash
lerna run test
```

### Publishing a New SDK version (MongoDB Internal Contributors Only)

The [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/install-bundle.html) client is required
along with relevant permissions to the stitch-sdks bucket.

You must also have `hub` installed for the script to properly generate the release pull request. Please see [Hub](https://github.com/github/hub) for installation details. 

You must also have `lerna` 3.13.0 or greater globally installed. If you have an older version of lerna, you can run `npm i -g lerna@3.13.2` to update.

1. Run `contrib/bump_version.sh <patch|minor|major> <jira_ticket>` with the desired version bump, and the JIRA ticket tracking the work to publish this release. This will update the version of the SDK in all of the appropriate package.json and lerna files, it will update the version of the SDK in the browser SDK README.md so that it refers to the latest version of the SDK, and it will open a PR. 

2. Go to [JavaScript SDK](https://github.com/mongodb/stitch-js-sdk/pulls) and request a reviewer on the pull request (mandatory) before merging and deleting the release branch.

3. Once the pull request created by `bump_version.sh` is successfully merged into Github publish the SDK by running `contrib/publish_sdk.sh`. This will publish the latest version of the SDK to `npm`. You will need to be a member of the `mongodb-stitch` organization on `npm` for this command to work.

4. Run `./publish_bundles.sh` to publish the browser SDK bundles to AWS S3.

5. Run `./publish_docs.sh` to generate the docs and publish them to AWS S3.

### Patch Versions

The work for a patch version should happen on a "support branch" (e.g. 1.2.x). The purpose of this is to be able to support a minor release while excluding changes from the mainstream (`master`) branch. If the changes in the patch are relevant to other branches, including `master`, they should be backported there. 

### Major Versions

The release on GitHub should be edited for a more readable format of key changes and include any migration steps needed to go from the last major version to this one.
