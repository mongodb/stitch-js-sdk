#!/bin/bash

pushd "$(dirname "$0")" > /dev/null

# Check the cache to see whether the generated theme is up-to-date.

CHECKSUM_FILE=./bin/sourceChecksum
CHECKSUM=

function calculate_checksum() {
  CHECKSUM=`find ./src gruntfile.js package.json -type f | xargs md5 | md5 -p | tail -n 1`
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
  echo "TypeDoc theme up-to-date."
  exit 0
fi

# Generate the theme and update the cache.
echo "Generating TypeDoc theme..."
set -e
npm install
grunt --gruntfile gruntfile.js
calculate_checksum
echo -n $CHECKSUM > $CHECKSUM_FILE
