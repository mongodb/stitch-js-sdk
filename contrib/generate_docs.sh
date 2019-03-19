#!/bin/bash -e

function usage() {
    echo "Usage: $0 <browser|server|react-native> [analytics]"
    exit 1
}

cd "$(dirname "$0")"/..

TYPEDOC=./node_modules/.bin/typedoc

npm run docs-theme

sdk="$1"

if [ -z "$sdk" ]; then
    usage
fi

case "$sdk" in
    browser)
        pretty_name="Browser"
        ;;
    server)
        pretty_name="Server"
        ;;
    react-native)
        pretty_name="React Native"
        ;;
    *)
        echo "Unrecognized SDK: $sdk"
        usage
        ;;
esac

# Co-opting gaID flag because Typedoc does not currently allow arbitrary settings 
# and we don't want to put analytics on local docs builds. The second parameter
# is optional.
if [ "$2" == "analytics" ]; then
    gaID="--gaID 1"
elif [[ ! -z "$2" ]]; then
    echo "Unrecognized argument: $2"
    usage
fi

"$TYPEDOC" \
    --name "MongoDB Stitch $pretty_name SDK" \
    --out ./docs-$sdk \
    --mode file \
    --tsconfig config/tdconfig.$sdk.json \
    --readme packages/$sdk/sdk/README.md \
        packages/$sdk/core/src/index.ts \
        packages/core/sdk/src/index.ts \
        packages/core/services/*/src/index.ts \
        packages/$sdk/services/*/src/index.ts \
    --ignoreCompilerErrors \
    --excludeNotExported \
    --theme typedoc-theme/bin/ \
    $gaID \
    --plugin \
      "`pwd`"/contrib/typedoc-plugin-code-examples,"`pwd`"/contrib/typedoc-plugin-tags-by-name,"`pwd`"/contrib/typedoc-plugin-copy-buttons-support \
    --examplesPath contrib/docs-examples/snippets/$sdk,contrib/docs-examples/snippets

