'use strict';

const { start, get_type, get_http, get_messages, get_remaining_time_ms, get_memory_limit_mb, get_response, done } = require('./');

exports.lambdaHandler = async (event, context) => {

    try {

        start(event, context);

        const type = get_type();
        const messages = get_messages();
        const remaining_time_ms = get_remaining_time_ms();
        const memory_limit_mb = get_memory_limit_mb();
        const response = get_response();

        console.log({type, messages, remaining_time_ms, memory_limit_mb, response});

        if (type === 'http') {
            const http = get_http();
            console.log(http);
        }
        
        return response;

    } finally {
        done();
    }
};