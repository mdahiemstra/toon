"use strict";

var request = require('sync-request');
var uuid = require('uuid-js');

function Toon(credentials) {
	this.endpoint = 'https://toonopafstand.eneco.nl/toonMobileBackendWeb/client';
	this.credentials = credentials;
	this.session = null;
	this.state = null;

	/**
	 * Login on initialization for testing purposes
	 */
	this.login();
}

Toon.prototype.login = function() {
	var response = request('GET', this.endpoint + '/login', {qs: this.credentials});
	this.session = JSON.parse(response.body.toString());

	var params = {
		clientId: this.session.clientId,
		clientIdChecksum: this.session.clientIdChecksum,
		agreementId: this.session.agreements[0].agreementId,
		agreementIdChecksum: this.session.agreements[0].agreementIdChecksum,
		random: uuid.create(1)
	};

	request('GET', this.endpoint + '/auth/start', {qs: params});
};

Toon.prototype.logout = function() {
	var response = request('GET', this.endpoint + '/login', {qs: this.credentials});
	this.session = JSON.parse(response.body.toString());

	var params = {
		clientId: this.session.clientId,
		clientIdChecksum: this.session.clientIdChecksum,
		random: uuid.create(1)
	};

	request('GET', this.endpoint + '/auth/logout', {qs: params});

	this.session = null;
	this.state = null;
};

Toon.prototype.retrieve_state = function() {
	if (this.state) {
		return false;
	}

	var params = {
		clientId: this.session.clientId,
		clientIdChecksum: this.session.clientIdChecksum,
		random: uuid.create(1)
	};

	var response = request('GET', this.endpoint + '/auth/retrieveToonState', {qs: params});

	this.state = JSON.parse(response.body.toString());
};

/**
 * Toon methods
 */

Toon.prototype.refresh_state = function() {
	this.state = null;
	this.retrieve_state();
};

Toon.prototype.get_gas_usage = function() {
	this.retrieve_state();
	return this.state.gasUsage;
};

Toon.prototype.get_power_usage = function() {
	this.retrieve_state();
	return this.state.powerUsage;
};

Toon.prototype.get_thermostat_info = function() {
	this.retrieve_state();
	return this.state.thermostatInfo;
};

Toon.prototype.get_thermostat_states = function() {
	this.retrieve_state();
	return this.state.thermostatStates;
};

Toon.prototype.get_program_state = function() {
	this.retrieve_state();
	return this.state.thermostatInfo.activeState;
};

Toon.prototype.set_thermostat = function(temperature) {
	temperature = temperature * 100;

	var params = {
		clientId: this.session.clientId,
		clientIdChecksum: this.session.clientIdChecksum,
		value: temperature,
		random: uuid.create(1)
	};

	var response = request('GET', this.endpoint + '/auth/setPoint', {qs: params});

	return JSON.parse(response.body.toString());
};

Toon.prototype.set_program_state = function(state) {
	var params = {
		clientId: this.session.clientId,
		clientIdChecksum: this.session.clientIdChecksum,
		state: 2,
		temperatureState: state,
		random: uuid.create(1)
	};

	var response = request('GET', this.endpoint + '/auth/schemeState', {qs: params});

	return JSON.parse(response.body.toString());
};

module.exports = Toon;
