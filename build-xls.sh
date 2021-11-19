#!/bin/bash

# 1) Install dependencies and build Angular Client
cd angular-client && npm install && npm run build-prod && cd ..

# 2) Configure environment properties ready for upload to S3
cp "./angular-client/etc/env/environment-xls.properties" ./angular-client/dist/angular-client/environment.properties
BUILD_VERSION="build.version = spreadsheet-0.0"
echo "build.env = dev" >> ./angular-client/dist/angular-client/environment.properties
cat "./angular-client/etc/version" >> ./angular-client/dist/angular-client/environment.properties

# 3) ...The last step is the manual 'DELETE'/'UPLOAD' OF THE dist/angular-client directory contents
#        to S3 via the DEV/TEST AWS management console

