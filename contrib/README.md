#### Publishing a new SDK version

```bash
# bump the version in package.json
npm version patch --no-git-tag-version 

# do a fresh build of everything in dist/
npm run build

# create a commit + tag for this npm version
export PACKAGE_VERSION=`node -e 'console.log(require("./package.json").version)'`
git commit -m "$PACKAGE_VERSION"
git tag "v$PACKAGE_VERSION"

# make live
git push && git push --tags
npm publish
```
