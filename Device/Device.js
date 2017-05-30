'use strict';

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var colors = require('colors');
var Message = require('azure-iot-device').Message;

//var connectionString = 'HostName=vjiotjourney.azure-devices.net;DeviceId=DeviceA;SharedAccessKey=EG7iQbrMpmqZ2UUmO1cTWed/X02pRSPywJsjX+/6esg=';

var client;
var refreshIntervalId;
var simulator;
const deepstream = require('deepstream.io-client-js')
const dsClient = deepstream('ws://localhost:6020').login()

console.log('Connected to control hub.');

const simulatorId = dsClient.getUid();
console.log('Identified as simulator ' + simulatorId.yellow);

dsClient.record.getRecord(simulatorId).set({
  runtime: 'console',
  status: 'waiting',
  simulatorId: simulatorId,
  frequency: 10,
  payload: '{"windSpeed": 0, "temperature": 0}',
  connectionString: '',
});

const list = dsClient.record.getList('simulators');
list.addEntry(simulatorId);

dsClient.rpc.provide(simulatorId, (data, response) => {

  simulator = dsClient.record.getRecord(simulatorId);

  if (data.action == 'test') {
    test();
  }
  else if (data.action == 'start') {
    startSimulation();
  }
  else if (data.action == 'stop') {
    clearInterval(refreshIntervalId);
    console.log('Stopped simulation.'.red)
  }
  else if (data.action == 'delete') {
    process.exit();
  }
});

function test() {

  if (simulator.get('connectionString').length > 0) {
    console.log('Testing simulator message send...')
    client = clientFromConnectionString(simulator.get('connectionString'));
    client.open(connectCallback);

    var message = new Message(simulator.get('payload'));

    client.sendEvent(message, printResultFor('send'));
    console.log('Sent message: '.cyan + message.getData().cyan);
  }
}

function startSimulation() {
  console.log('Starting simulation with a '.green + simulator.get('frequency') + ' second interval'.green);

  clearInterval(refreshIntervalId);

  refreshIntervalId = setInterval(function () {
    var windSpeed = 10 + (Math.random() * 4);
    var payload = JSON.parse(simulator.get('payload'));

    payload.windSpeed = windSpeed;

    var message = new Message(JSON.stringify(payload));
    console.log("Sending message: ".cyan + message.getData().cyan);
    client.sendEvent(message, printResultFor('send'));

  }, simulator.get('frequency') * 1000);
}

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