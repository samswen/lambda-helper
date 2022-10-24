'use strict';

const EventContext = require('./EventContext');
const Emfiles = require('./Emfiles');

module.exports = {

    get_type_messages,
    get_response,
    start_emfiles_verify,
    final_emfiles_check,

    start,

    get_type,
    get_http,
    get_messages,
    get_remaining_time_ms,
    get_memory_limit_mb,

    done,
};

let emfiles;
let event_context;

function start(event, context) {
    start_emfiles_verify();
    event_context = new EventContext(event, context);
}

function done(max_emfiles_needed = 100) {
    final_emfiles_check(max_emfiles_needed);
}

async function start_emfiles_verify() {
    if (!emfiles) emfiles = new Emfiles();
    emfiles.start_verify();
}

async function final_emfiles_check(max_emfiles_needed = 100, exit_process = true) {
    emfiles?.final_check(max_emfiles_needed, exit_process)
}

function get_type_messages(event, context) {
    event_context = new EventContext(event, context);
    const {type, messages} = event_context;
    return {type, messages};
}

function get_response(data = 'OK', status_code = 200) {
    return event_context?.get_response(data, status_code);
}

function get_type() {
    return event_context?.get_type();
}

function get_http() {
    return event_context?.get_http();
}

function get_messages() {
    return event_context?.get_messages();
}

function get_remaining_time_ms() {
    return event_context?.get_remaining_time_ms();
}

function get_memory_limit_mb() {
    return event_context?.get_memory_limit_mb();
}