#!/bin/bash

if [[ -z $STAGE ]]; then
    STAGE=dev
fi

./node_modules/.bin/serverless create_domain
./node_modules/.bin/serverless --stage=${STAGE} deploy
