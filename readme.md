# help functions for aws lambda

An effort to enable single lambda handles functionally the same requests from different sources: console test, sns, sqs, api gateway and api invoke. It also addresses AWS lambda EMFILE issue.

The packages collects code and ideas from <a href="https://github.com/samswen/lambda-emfiles">lambda-emfiles</a> and <a href="https://github.com/samswen/aws-event">aws-event</a>. It includes few improvements and replaces both packages.

# how to use

## install

npm install @samwen/lambda-helper

## example

<pre>
'use strict';

const { start, get_type, get_messages, get_remaining_time_ms, get_memory_limit_mb, get_response, done } = require('@samwen/lambda-helper');

exports.lambdaHandler = async (event, context) => {

    try {
        
        start(event, context);

        const type = get_type();
        const messages = get_messages();
        const remaining_time_ms = get_remaining_time_ms();
        const memory_limit_mb = get_memory_limit_mb();
        const response = get_response();

        console.log({type, messages, remaining_time_ms, memory_limit_mb, response});

        return response;

    } finally {
        done();
    }
};
<pre>