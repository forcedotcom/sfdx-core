/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Units of time
 */
export enum TIME_UNIT {
    MINUTES,
    MILLISECONDS,
    SECONDS
}
/**
 * Helper class to convert cli times between minutes, seconds, and milliseconds.
 */
export class Time {

    public static readonly MILLI_IN_SECONDS: number = 1000;
    public static readonly SECONDS_IN_MINUTE: number = 60;

    private readonly quantity: number;
    private readonly unit: TIME_UNIT;

    constructor(quantity: number, unit: TIME_UNIT = TIME_UNIT.MINUTES) {
        this.quantity = quantity;
        this.unit = unit;
    }

    get minutes(): number {
        switch (this.unit) {
            case TIME_UNIT.MINUTES:
                return this.unit;
            case TIME_UNIT.SECONDS:
                return Math.round(this.quantity / Time.SECONDS_IN_MINUTE);
            case TIME_UNIT.MILLISECONDS:
                return Math.round(this.quantity / Time.MILLI_IN_SECONDS / Time.SECONDS_IN_MINUTE);
            default:
                return -1;
        }
    }

    get seconds(): number {
        switch (this.unit) {
            case TIME_UNIT.MINUTES:
                return this.quantity * Time.SECONDS_IN_MINUTE;
            case TIME_UNIT.SECONDS:
                return this.quantity;
            case TIME_UNIT.MILLISECONDS:
                return Math.round(this.quantity / Time.MILLI_IN_SECONDS);
            default:
                return -1;
        }
    }

    get milliseconds(): number {
        switch (this.unit) {
            case TIME_UNIT.MINUTES:
                return this.quantity * Time.SECONDS_IN_MINUTE * Time.MILLI_IN_SECONDS;
            case TIME_UNIT.SECONDS:
                return this.quantity * Time.MILLI_IN_SECONDS;
            case TIME_UNIT.MILLISECONDS:
                return this.quantity;
            default:
                return -1;
        }
    }
}
