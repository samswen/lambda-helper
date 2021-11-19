# help functions for aws lambda

An effort to enable single lambda handles functionally the same requests from different sources: console test, sns, sqs, api gateway and api invoke. It also addresses AWS lambda EMFILE issue.

The packages collects code and ideas from <a href="https://github.com/samswen/lambda-emfiles">lambda-emfiles</a> and <a href="https://github.com/samswen/aws-event">aws-event</a>. It includes few improvements and replaces both packages.

# how to use

## install

npm install @samwen/lambda-helper

## example

<pre>
'use strict';

const helper = require('@samwen/lambda-helper');

exports.lambdaHandler = async (event, context) => {
    helper.start_emfiles_verify();
    try {
        const {type, messages} = helper.get_type_messages(event, context);
        const data = {status: 'OK'};
        const response = helper.get_response(data);
        console.log({type, messages, response});
        return response;
    } finally {
        helper.final_emfiles_check();
    }
};
<pre>