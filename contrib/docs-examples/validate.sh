#!/bin/bash -e

if [ -z "$1" ]
then
  echo "Usage: $0 <snippet file> [browser|server]"
  exit 1
fi

if [ ! -d "node_modules" ]
then
  npm install
fi

# Get absolute path to snippet
snippet=("$(cd "$(dirname "$1")"; pwd)/$(basename "$1")")

pushd "$(dirname "$0")" > /dev/null

ESLINT="./node_modules/.bin/eslint"

validate_js="./validate.js"
if [ "$2" == "browser" ]
then
  validate_js="./validate_browser.js"
fi
echo "Using validator: $validate_js"

set +e

"$ESLINT" "$snippet" \
  && cat "$snippet" "$validate_js" \
  | npx babel -f "$validate_js" \
  | node
if [ $? == 1 ]
then
  echo "Snippet validation failed. See above output."
  exit 1
fi
