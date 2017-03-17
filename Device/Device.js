'use strict';

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var connectionString = 'HostName=vjiot.azure-devices.net;DeviceId=Device00000001;SharedAccessKey=pLwiv8chaNjIesQL0sNVoReBk1g+276Ao6TUUpYTQUI=';

var client = clientFromConnectionString(connectionString);

const deepstream = require('deepstream.io-client-js')
const dsClient = deepstream('ws://vjiotprofiler.westeurope.cloudapp.azure.com:6020').login()

var record = dsClient.record.getRecord('some-name');
var refreshIntervalId;

record.subscribe('firstname', function (value) {
  console.log(value);
})

dsClient.rpc.provide('start-test', (data, response) => {
  response.send('Test with interval ' + data.frequency + ' initiated.');
});

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
    console.log('Client connected');

    // Create a message and send it to the IoT Hub every second

  }
};

client.open(connectCallback);


