"use strict";

var toon = require('./toon');

/**
 * Initialize Toon with your Toon credentials
 */
var Toon = new toon({username: '', password: ''});

/**
 * Example:
 * Get the current gas usage
 *
 * for all available methods see toon.js
 */
var gas = Toon.get_gas_usage();
console.log(gas);
