'use strict';

const { get_type_messages, get_response, start_emfiles_verify, final_emfiles_check } = require('./');

exports.lambdaHandler = async (event, context) => {
    start_emfiles_verify();
    try {
        console.log('event', JSON.stringify(event));
        console.log('context', JSON.stringify(context));
        const {type, messages} = get_type_messages(event, context);
        const response = get_response({status: 'OK'});
        console.log({type, messages, response});
        return response;
    } finally {
        final_emfiles_check();
    }
};