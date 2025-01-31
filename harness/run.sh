#!/bin/bash

SUBMISSION_PATH_RELATIVE=$1

if [ -z "$SUBMISSION_PATH_RELATIVE" ]; then
  echo "Usage: $0 <submission-path>"
  exit 1
fi

# resolve relative path
SUBMISSION_PATH=$(realpath $SUBMISSION_PATH_RELATIVE)

source ../autograder/autograder-config.sh

docker build -t $AUTOGRADER_IMAGE ../autograder

chmod 777 $(pwd)/update_harness.py

  # -it --entrypoint /bin/bash \
docker run \
  -v $(pwd)/harness.py:/autograder/harness.py \
  -v $(pwd)/update_harness.py:/autograder/update_harness.py \
  -v $(pwd)/../autograder-results:/autograder/results \
  -v $SUBMISSION_PATH:/autograder/submission \
  $AUTOGRADER_IMAGE
