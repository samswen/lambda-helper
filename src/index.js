'use strict';

const EventContext = require('./EventContext');
const Emfiles = require('./Emfiles');

module.exports = {
    get_type_messages,
    get_response,
    start_emfiles_verify,
    final_emfiles_check,
};

let emfiles;
let event_context;

async function start_emfiles_verify(max_emfiles_needed = 100, exit_process = false) {
    if (!emfiles) emfiles = new Emfiles();
    await emfiles.start_verify(max_emfiles_needed, exit_process);
}

async function final_emfiles_check(max_emfiles_needed = 100, exit_process = true) {
    if (emfiles) {
        await emfiles.final_check(max_emfiles_needed, exit_process)
    }
}

function get_type_messages(event, context) {
    event_context = new EventContext(event, context);
    const {type, messages} = event_context;
    return {type, messages};
}

function get_response(data, status_code = 200) {
    if (event_context) {
        return event_context.get_response(data, status_code);
    }
    return data;
}