Credits
=======
This module was originaly created by [https://github.com/rvdm/toon](https://github.com/rvdm/toon) in Python, all credits go to the original author. I only ported his work to nodejs.

Toon
====

A simple nodejs module to interface with the Eneco Toon 'intelligent' thermostat.

The Toon API and clients
====

The Toon device is a rebranded 'quby' (http://quby.nl/) thermostat. It
interfaces with a few web services at Eneco, and gathers power, gas and
thermostat information.
When using the Toon along with the 'Toon op afstand' option, some of the
Toon information and settings can be accessed via a simple iPhone app.

Eneco's iPhone client for Toon is essentially a browser object, connecting
to the 'toon op afstand' web pages at https://toonopafstand.eneco.nl/ .
The toonopafstand web app consumes an API being served out of the same
domain.

As the Toon client is written in JavaScript, it's easy to reverse-engineer
the calls, and to re-create them in python.

Authentication
===
Authentication to the Toon API is a two-step process. No cookies or referer
settings are required.
1) 
Log in using the 'toonopafstand' username and password. The username and
password are the same as the ones you use for 'mijn eneco'.
The login response returns a JSON blob with some address and agreement
information:

```
{
	agreements: [{
		agreementId: 'SOMEINTEGER',
		agreementIdChecksum: 'SOMECHECKSUM',
		city: 'SOMECITY',
		displayCommonName: 'eneco-xxx-yyyyyy',
		displayHardwareVersion: 'qb2/ene/2.6.24',
		displaySoftwareVersion: 'qb2/ene/2.6.24',
		houseNumber: 'xx',
		postalCode: 'xxxxAB',
		street: 'SOMESTREET'
	}],
	clientId: 'SOMEUUID',
	clientIdChecksum: 'SOMECHECKSUM',
	passwordHash: 'SOMEHASH',
	sample: false,
	success: true
}
```

2) 
Grab the JSON response from the login request, and extract the agreement
information. The agreement information is subsequently used to start a
session, and to allow retrieval of data. My guess is that the two-step
process might allow for a 'select your toon' feature in the future, assuming
people can have more of them.

The session start return simply returns 'success:true' on success.


Retrieving status
===

Retrieving status is a simple call, re-using the agreement information from
the second step of the authentication process. 
The status retrieval call accepts clientId, clientIdChecksum, agreementID
and agreementIdChecksum as parameters. The API expects an additional
parameter called random, containing a random UUID.

The return JSON looks like this:
```
{
	gasUsage: {
		avgDayValue: 25498.57,
		avgValue: 1062.44,
		dayCost: 0.0,
		dayUsage: 19380,
		isSmart: 0,
		meterReading: 4840000,
		value: 0
	},
	powerUsage: {
		avgValue: 477.99,
		dayCost: 2.7,
		dayCostProduced: 0.00,
		dayLowUsage: 7713,
		dayUsage: 0,
		isSmart: 0,
		meterReading: 2521773,
		meterReadingLow: 2431872,
		value: 511,
		valueProduced: 0
	},
	thermostatInfo: {
		activeState: 0,
		burnerInfo: 0,
		currentModulationLevel: 16,
		currentSetpoint: 1950,
		currentTemp: 1959,
		errorFound: 255,
		haveOTBoiler: 0,
		nextProgram: 1,
		nextSetpoint: 1550,
		nextState: 2,
		nextTime: 1391900400,
		otCommError: 0,
		programState: 1,
		randomConfigId: 1804289383,
		zwaveOthermConnected: 0
	},
	thermostatStates: {
		state: [
			{dhw: 1, id: 0, tempValue: 1950}, 
			{dhw: 1, id: 1, tempValue: 1850},
			{dhw: 1, id: 2, tempValue: 1550},
			{dhw: 1, id: 3, tempValue: 1200},
			{dhw: 0, id: 4, tempValue: 600},
			{dhw: 1, id: 5, tempValue: 600}
		]
	}
}
```


Example
====

```javascript
"use strict";

var toon = require('./toon');

/**
 * Initialize Toon with your Toon credentials
 */
var Toon = new toon({username: 'TOONUSERNAME', password: 'TOONPASSWORD'});

/**
 * Get the current gas usage
 *
 * for all available methods see toon.js
 */
var gas = Toon.get_gas_usage();

// RESPONSE:
//{
//	value: 0,
//	dayCost: 0,
//	avgValue: 331.85,
//	meterReading: 425770,
//	avgDayValue: 7964.29,
//	dayUsage: 7590,
//	isSmart: 0 
//}
```
