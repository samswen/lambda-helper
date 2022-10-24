'use strict';

class EventContext {

    constructor(event, context) {
        this.context = context;
        this.type = '';
        this.arns = [];
        this.get_type_and_messages(event, context);
    }

    get_type() {
        return this.type;
    }

    get_arns() {
        return this.arns;
    }

    get_messages() {
        return this.messages;
    }

    get_http() {
        return this.http;
    }

    get_remaining_time_ms() {
        return this.context.getRemainingTimeInMillis();
    }

    get_memory_limit_mb() {
        return Number(this.context.memoryLimitInMB);
    }

    /**
     * 
     * @param {*} data data to include in the response
     * @param {*} status_code status code for http response
     * @returns 
     */
    get_response(data = {status: 'OK'}, status_code = 200) {
        if (this.type === 'http') {
            const headers = {};
            let body;
            if (typeof data === 'object') {
                body = JSON.stringify(data);
                headers.contentType = 'application/json';
            } else {
                body = data;
                headers.contentType = 'text/plain';
            }
            return {
                isBase64Encoded: false,
                statusCode: status_code,
                headers, body
            };
        } else {
            return data;
        }
    }

    /**
     * private
     * @param {*} event the first argument of the lambda function
     * @param {*} context the seconds argument of the lambda function
     * @returns 
     */
    get_type_and_messages(event, context) {

        if (!this.messages) this.messages = [];

        if (event.Records) {
            this.parse_records(event.Records);
        } else if (event.headers) {
            this.parse_http(event);
        } else if (event.source && event.detail) {
            this.type = 'event';
            this.messages = [ event ];
        } else if (context.clientContext) {
            this.type = 'invoke';
            this.messages.push({...event, ...context.clientContext});
        } else {
            this.type = 'json';
            this.messages.push(event);
        }
    }

    // private
    parse_http(event) {
        this.type = 'http';
        this.http = event.requestContext.http;
        this.http.headers = event.headers;
        const message = {};
        if (event.pathParameters) {
            Object.assign(message, event.pathParameters);
        }
        if (event.queryStringParameters) {
            this.http.query = event.queryStringParameters;
            Object.assign(message, event.queryStringParameters);
        }
        if (event.body) {
            const body = this.get_body(event);
            if (typeof body === 'object') {
                Object.assign(message, body);
            } else {
                message.body = body;
            }
            this.http.body = body;
        }
        this.messages.push(message);
    }

    // private
    parse_records(Records) {
        for (const record of Records) {
            const { EventSource, eventSource } = record;
            const source = EventSource || eventSource;
            switch (source) {
                case 'aws:sns': {
                    if (this.type) this.type += '/sns';
                    else this.type = 'sns';
                    this.arns.push(record.Sns.TopicArn);
                    this.parse_result(record.Sns.Message);
                    break;
                }
                case 'aws:sqs': {
                    if (this.type) this.type += '/sqs';
                    else this.type = 'sqs';
                    this.arns.push(record.eventSourceARN);
                    this.parse_result(record.body);
                    break;
                }
                case 'aws:s3': {
                    if (this.type) this.type += '/s3';
                    else this.type = 's3';
                    this.arns.push(record.s3.bucket.arn);
                    this.messages.push(record.s3);
                    break;
                }
                default: {
                    console.error('unsupported event source', source)
                }
            }
        }
    }

    // private
    parse_result(input) {
        const result = this.try_json(input);
        if (result.Type === 'Notification' && result.Message) {
            this.type += '/sns';
            this.arns.push(result.TopicArn);
            const message = this.try_json(result.Message);
            if (message.Records) {
                this.parse_records(message.Records);
            } else {
                this.messages.push(message);
            }
        } else if (result.Records) {
            this.parse_records(result.Records);
        } else {
            this.messages.push(result);
        }
    }

    // private
    get_body(event) {
        const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf-8') : event.body;
        return this.try_json(body);
    }
    
    // private
    try_json(message) {
        if (typeof message === 'string') {
            message = message.trim();
            const first_char = message.charAt(0);
            const last_char = message.charAt(message.length - 1)
            if ((first_char === '{' && last_char === '}') || 
                (first_char === '[' && last_char === ']')) {
                try { message = JSON.parse(message) } catch(err) {
                    //
                }
            }
        }
        return message;
    }
}

module.exports = EventContext;