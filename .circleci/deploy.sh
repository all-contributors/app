#!/bin/bash

if [[ -z $STAGE ]]; then
    STAGE=dev
fi

./node_modules/.bin/serverless --stage=${STAGE} deploy
