#!/bin/bash

pushd "$(dirname "$0")" > /dev/null
if [[ ! -d "./node_modules" ]]; then
    echo "Installing dependencies in typedoc-theme/..."
    npm install
fi
popd > /dev/null

