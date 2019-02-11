#!/bin/bash

# Validate the docs code examples. If something broke, please alert @docs-stitch-team.

pushd "$(dirname "$0")" > /dev/null

# Tip: Commit the checksum file with any changes to the snippets after validation.

# Check for changes to the source before running the long validation process...
CHECKSUM_FILE=./checksum
CHECKSUM=

function calculate_checksum() {
  CHECKSUM=`find snippets -iname "*.js" | xargs md5 -q | md5 -q`
}

function update_required() {
  if [ ! -f $CHECKSUM_FILE ]; then
      # Checksum file does not exist yet, which implies 
      # the theme has not been generated yet.
      return 1
  fi

  calculate_checksum

  if [[ $(< $CHECKSUM_FILE) != $CHECKSUM ]]; then
      return 1
  fi
  return 0
}

update_required
if [ $? == 0 ]; then
  echo "No change to snippets since last validation."
  exit 0
fi

./validate.sh \
  ./snippets/*.js \
  ./snippets/browser/*.js \
  ./snippets/server/*.js \
  ./snippets/react-native/*.js

calculate_checksum
echo -n $CHECKSUM > $CHECKSUM_FILE
