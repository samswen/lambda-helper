'use strict';

const fs = require('fs');

const max_fds_allowed = 1000;

class Emfiles {

    constructor() {
        this.is_new = true;
        this.emfiles_count = 0;
        this.initial_count = 0;
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
        this.update_lambda_emfiles_count();
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
        const leaks = this.update_lambda_emfiles_count();
        if (leaks > 0) {
            console.log(`*** emfiles count: ${this.emfiles_count}, leaks: ${leaks}, max leaks: ${this.max_leaks}`);
        } else {
            console.log(`*** no leak emfiles found, max leaks: ${this.max_leaks}`);
        }
        if (exit_process) {
            if (max_fds_allowed - this.initial_count - this.max_leaks < max_emfiles_needed) {
                process.exit(1);
            }
        }
    }

    /**
     * private implementation
     */
    update_lambda_emfiles_count() {
        const emfiles_count = this.emfiles_count;
        this.emfiles_count = fs.readdirSync(`/proc/${process.pid}/fd`).length;
        let leaks = this.emfiles_count > emfiles_count ? this.emfiles_count - emfiles_count : 0;
        if (this.is_new) {
            this.initial_count = leaks;
            leaks = 0;
        } else {
            leaks -= this.initial_count;
            if (leaks < 0) leaks = 0;
            if (leaks > this.max_leaks) this.max_leaks = leaks;
        }
        return leaks;
    }
}

module.exports = Emfiles;