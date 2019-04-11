#!/bin/sh

set -e

# Let this be run from any directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
cd ..

# TODO: determine if we need to push a tag as well?

lerna publish from-git
