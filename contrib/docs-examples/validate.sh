#!/bin/bash

snippets=()
for snippet in $@
do
  # Add the absolute path to each snippet
  snippets+=("$(cd "$(dirname "$snippet")"; pwd)/$(basename "$snippet")")
done

pushd "$(dirname "$0")" > /dev/null

if [ ! -d "node_modules" ]
then
  npm install
fi

if [ -z "$1" ]
then
  echo "Usage: $0 <snippet files ...>"
fi

failed=()

echo "Validating snippets... (If a snippet is taking more than a few seconds, use ctrl-C and try again.)"
for snippet in "${snippets[@]}"
do
  echo -n "Validating $snippet... "
  OUTPUT="$(eslint "$snippet" \
    && cat "$snippet" ./validate.js \
    | npx babel -f validate.js \
    | node)"
  if [ $? == 1 ]
  then
    echo "FAILED:"
    echo "$OUTPUT"
    failed+="$snippet"
    continue
  fi
  echo "success!"
done

echo
echo "Code example validation complete."

if [ ${#failed[@]} != 0 ]
then
  echo "FAILED:"
  for snippet in "${failed[@]}"
  do
    echo "  $snippet"
  done
fi
echo
