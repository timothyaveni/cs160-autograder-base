#!/bin/bash

SUBMISSION_PATH_RELATIVE=$1

if [ -z "$SUBMISSION_PATH_RELATIVE" ]; then
  echo "Usage: $0 <submission-path>"
  exit 1
fi

# resolve relative path
SUBMISSION_PATH=$(realpath $SUBMISSION_PATH_RELATIVE)

docker build -t timothyaveni/cs160-su24-pa-1-autograder ../autograder

chmod 777 $(pwd)/update_harness.py

  # -it --entrypoint /bin/bash \
docker run \
  -v $(pwd)/harness.py:/autograder/harness.py \
  -v $(pwd)/update_harness.py:/autograder/update_harness.py \
  -v $(pwd)/../autograder-results:/autograder/results \
  -v $SUBMISSION_PATH:/autograder/submission \
  timothyaveni/cs160-su24-pa-1-autograder
