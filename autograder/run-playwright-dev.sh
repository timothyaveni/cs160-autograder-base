#!/bin/bash

# This script can be used to run Playwright in development, outside of the Docker container.
# We also process the results and output results.json straight to the console.

SUBMISSION_PATH=$1

if [ -z "$SUBMISSION_PATH" ]; then
  echo "Usage: $0 <submission-path>"
  exit 1
fi

rm -rf playwright/outputs

python3 -m http.server 6160 -d $SUBMISSION_PATH &> /dev/null &
STATIC_SERVER_PID=$!

# npx playwright test --ui
cd playwright
npx playwright test

kill $STATIC_SERVER_PID

cd .. && bash upload-report.sh > ./report-data.json

cd process-results
node process-results.js

rm ../report-data.json

cat results.json
