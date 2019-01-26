#!/bin/bash

if [[ -z $STAGE ]]; then
    STAGE=dev
fi

if [[ ${STAGE} == 'sandbox' ]]; then
    echo 'Using sandbox secrets'
    export WEBHOOK_SECRET=${SANDBOX_WEBHOOK_SECRET}
    export PRIVATE_KEY=${SANDBOX_PRIVATE_KEY}
else
    echo 'Using production secrets'
fi

./node_modules/.bin/serverless --stage=${STAGE} deploy
