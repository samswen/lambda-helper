'use strict';

const fs = require('fs');
const max_fds_allowed = 1000;

class Emfiles {

    constructor() {
        this.is_new = true;
        this.emfiles_count = 0;
        this.max_leaks = 0;
    }

    /**
     * public
     * 
     * @param {*} max_emfiles_needed estimated max file descriptors are needed
     * @param {*} exit_process to exit the running process if not ok
     * @returns 
     */
    start_verify(max_emfiles_needed = 100, exit_process = false) {
        this.#update_lambda_emfiles_count();
        console.log(`*** ${this.is_new ? 'new' : 'old'} process, emfiles count: ${this.emfiles_count}`);
        this.is_new = false;
        if (exit_process && max_fds_allowed - this.emfiles_count < max_emfiles_needed) {
            process.exit(1);
        }
    }

    /**
     * public
     * *
     * @param {*} max_emfiles_needed estimated max file descriptors are needed
     * @param {*} exit_process to exit the running process if not ok
     *
     */
    final_check(max_emfiles_needed = 100, exit_process = true) {
        const emfiles_count = this.emfiles_count;
        this.#update_lambda_emfiles_count();
        if (this.emfiles_count > emfiles_count) {
            const leaks = this.emfiles_count - emfiles_count;
            if (leaks > this.max_leaks) {
                this.max_leaks = leaks;
            }
            console.log(`*** emfiles count: ${this.emfiles_count}, leaks: ${leaks}`);
        } else {
            console.log('*** no leak emfiles found');
        }
        if (exit_process) {
            if (max_emfiles_needed < this.max_leaks) {
                max_emfiles_needed = this.max_leaks;
            }
            if (max_fds_allowed - this.emfiles_count < max_emfiles_needed) {
                process.exit(1);
            }
        }
    }

    /**
     * private implementation
     */
    #update_lambda_emfiles_count() {
        this.emfiles_count = fs.readdirSync(`/proc/${process.pid}/fd`).length - 1;
    }
}

module.exports = Emfiles;