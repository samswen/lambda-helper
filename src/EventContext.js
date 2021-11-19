'use strict';

class EventContext {

    constructor(event, context) {
        this.get_type_and_messages(event, context);
    }

    get type() {
        return this._type;
    }

    get messages() {
        return this._messages;
    }

    /**
     * 
     * @param {*} data data to include in the response
     * @param {*} status_code status code for http response
     * @returns 
     */
    get_response(data, status_code = 200) {
        if (this.type === 'http') {
            const headers = {};
            let body = '';
            if (data) {
                if (typeof data === 'object') {
                    body = JSON.stringify(data);
                    headers.contentType = 'application/json';
                } else {
                    body = data;
                    headers.contentType = 'text/plain';
                }
            }
            return {
                isBase64Encoded: false,
                statusCode: status_code,
                headers, body
            };
        } else if (this.type === 'sns' || this.type === 'sqs') {
            if (status_code < 400) return 'OK'
            else return 'failed';
        } else {
            return data;
        }
    }

    /**
     * 
     * @param {*} event the first argument of the lambda function
     * @param {*} context the seconds argument of the lambda function
     * @returns 
     */
    get_type_and_messages(event, context) {
        if (event.Records && Array.isArray(event.Records) && event.Records.length > 0) {
            if (event.Records[0].EventSource === 'aws:sns') {
                this._type = 'sns';
                this._messages = [];
                for (const record of event.Records) {
                    this._messages.push(this.#try_json(event.Records[0].Sns.Message));
                }
                return;
            } else if (event.Records[0].eventSource === 'aws:sqs') {
                this._type = 'sqs';
                this._messages = [];
                for (const record of event.Records) {
                    this._messages.push(this.#try_json(record.body))
                }
                return;
            }
        }
        if (event.queryStringParameters) {
            this._type = 'http';
            const message = {...event.queryStringParameters};
            if (event.body) {
                const body = this.#get_body(event);
                if (body && typeof body === 'object') {
                    Object.assign(message, body);
                } else {
                    message.body = body;
                }
            }
            this._messages = [message];
            return
        } 
        if (Object.keys(event).length === 0 || (context && context.clientContext)) {
            this._type = 'invoke';
            this._messages = [context.clientContext];
            return;
        }
        this._type = 'json';
        this._messages = [event];
    }

    #get_body(event) {
        const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf-8') : event.body;
        return this.#try_json(body);
    }
    
    #try_json(message) {
        if (typeof message === 'string') {
            message = message.trim();
            const first_char = message.charAt(0);
            const last_char = message.charAt(message.length - 1)
            if ((first_char === '{' && last_char === '}') || 
                (first_char === '[' && last_char === ']')) {
                try { message = JSON.parse(message) } catch(err) {}
            }
        }
        return message;
    }
}

module.exports = EventContext;