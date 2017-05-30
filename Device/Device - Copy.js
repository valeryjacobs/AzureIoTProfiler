'use strict';

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

//var connectionString = 'HostName=vjiotjourney.azure-devices.net;DeviceId=DeviceA;SharedAccessKey=EG7iQbrMpmqZ2UUmO1cTWed/X02pRSPywJsjX+/6esg=';

var client;
const deepstream = require('deepstream.io-client-js')
//const dsClient = deepstream('ws://vjiotprofiler.westeurope.cloudapp.azure.com:6020').login()
const dsClient = deepstream('ws://localhost:6020').login()

dsClient.login({ username: 'genericclient', password: '12_qwasZX!@#' }, (success, data) => {
  if (success) {

    dsClient.record.getRecord(simulatorId).set({
      runtime: 'console',
      status: 'waiting',
      simulatorId: simulatorId,
      frequency: 10,
      payload: '{windSpeed: 0, temperature: 0}',
      connectionString: '',
    });

    const list = dsClient.record.getList('simulators');
    list.addEntry(simulatorId);

  } else {
    // extra data can be optionaly sent from deepstream for
    // both successful and unsuccesful logins
    console.log(data);

    // client.getConnectionState() will now return
    // 'AWAITING_AUTHENTICATION' or 'CLOSED'
    // if the maximum number of authentication
    // attempts has been exceeded.
  }
})

const simulatorId = dsClient.getUid();
console.log(simulatorId);

var record = dsClient.record.getRecord('some-name');
var refreshIntervalId;

record.subscribe('firstname', function (value) {
  console.log(value);
})

dsClient.rpc.provide('start-test', (data, response) => {
  console.log('start test');
  response.send('Test with interval ' + data.frequency + ' initiated.');
});

dsClient.rpc.provide(simulatorId, (data, response) => {

  var simulator = dsClient.record.getRecord(simulatorId);
  client = clientFromConnectionString(simulator.get('connectionString'));
  client.open(connectCallback);

  var data = JSON.stringify(simulator.get('payload'));
  var message = new Message(data);
  console.log("Sending message: " + message.getData());
  client.sendEvent(message, printResultFor('send'));

  console.log('Test with interval ' + data.frequency + ' and payload size ' + data.payloadSize + 'initiated.');
  //response.send('Test with interval ' + data.frequency + ' and payload size ' + data.payloadSize + 'initiated.');
});

// dsClient.rpc.provide(simulatorId,
//       function (data, response) {
//         console.log(data.frequency + ":" + data.payloadSize);
//         response.send('ok');
//       });


dsClient.event.subscribe('simulation/control/start', startSimulation);

function startSimulation(data) {
  console.log('Starting simulation with a ' + data.frequency + 'second interval');

  clearInterval(refreshIntervalId);

  refreshIntervalId = setInterval(function () {
    var windSpeed = 10 + (Math.random() * 4);
    var data = JSON.stringify({ deviceId: 'Device00000001', windSpeed: windSpeed });
    var message = new Message(data);
    console.log("Sending message: " + message.getData());
    client.sendEvent(message, printResultFor('send'));
  }, data.frequency * 1000);
}

dsClient.rpc.provide('stop-test', (data, response) => {
  clearInterval(refreshIntervalId);
});

function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

var connectCallback = function (err) {
  if (err) {
    console.log('Could not connect: ' + err);
  } else {



    console.log('Simulator connected. Awaiting instructions...');


  }
};




