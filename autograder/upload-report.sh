#!/bin/bash

source upload-server-vars.sh

cd playwright/outputs/html-report
zip -r ../report.zip . &> /dev/null
cd ..
curl -X POST -H "API-Key: $UPLOAD_SERVER_KEY" -F "file=@report.zip" "$UPLOAD_SERVER/upload" --no-alpn --no-npn | jq --arg host "$UPLOAD_SERVER" '. + {host: $host}'
rm report.zip