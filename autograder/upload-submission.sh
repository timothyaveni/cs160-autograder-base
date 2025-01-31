#!/bin/bash

source autograder-config.sh

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <submission-directory>"
    exit 1
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SUBMISSION_ZIP_FILE="$SCRIPT_DIR/submission.zip"

cd $1
zip -r $SUBMISSION_ZIP_FILE . &> /dev/null
cd $SCRIPT_DIR
curl -X POST -H "API-Key: $UPLOAD_SERVER_KEY" -F "file=@submission.zip" "$UPLOAD_SERVER/upload" --no-alpn --no-npn
rm $SUBMISSION_ZIP_FILE
