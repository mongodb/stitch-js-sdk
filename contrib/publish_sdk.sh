#!/bin/sh

set -e

# Let this be run from any directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
cd ..

lerna publish from-git
