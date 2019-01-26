#!/bin/bash

if [[ -z $STAGE ]]; then
    STAGE=dev
fi

if [[ ${STAGE} == 'sandbox' ]]; then
    echo 'Using sandbox secrets'
    echo 'You can test the sandbox over on: https://github.com/all-contributors-sandbox/test-all-contributors'
    export WEBHOOK_SECRET=${SANDBOX_WEBHOOK_SECRET}
    export PRIVATE_KEY=${SANDBOX_PRIVATE_KEY}
else
    echo 'Using production secrets'
fi

./node_modules/.bin/serverless --stage=${STAGE} deploy
