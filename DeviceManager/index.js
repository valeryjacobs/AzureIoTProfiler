'use strict';

var Registry = require('azure-iothub').Registry;
var Client = require('azure-iothub').Client;
var secrets = require('./secrets.js');

const deepstream = require('deepstream.io-client-js')
const dsClient = deepstream('ws://localhost:6020').login()


console.log(secrets.iotHubConnectionString);
var connectionString = secrets.iotHubConnectionString;
var registry = Registry.fromConnectionString(connectionString);
var client = Client.fromConnectionString(connectionString);


var startRebootDevice = function (deviceId) {
    console.log(deviceId)
    var methodName = "reboot";

    var methodParams = {
        methodName: methodName,
        payload: null,
        timeoutInSeconds: 30
    };

    client.invokeDeviceMethod(deviceId, methodParams, function (err, result) {
        if (err) {
            console.error("Direct method error: " + err.message);
        } else {
            console.log("Successfully invoked the device to reboot.");
        }
    });
};

var queryTwinLastReboot = function () {

    registry.getTwin(deviceToReboot, function (err, twin) {

        if (twin.properties.reported.iothubDM != null) {
            if (err) {
                console.error('Could not query twins: ' + err.constructor.name + ': ' + err.message);
            } else {
                var lastRebootTime = twin.properties.reported.iothubDM.reboot.lastReboot;
                console.log('Last reboot time: ' + JSON.stringify(lastRebootTime, null, 2));
            }
        } else
            console.log('Waiting for device to report last reboot time.');
    });
};

dsClient.rpc.provide('devicemanager', (data, response) => {

    //simulator = dsClient.record.getRecord(data.simulatorId);
    console.log('device manager :' + data.action);
    if (data.action == 'reboot') {
        startRebootDevice('DeviceA');
    }
});


//setInterval(queryTwinLastReboot, 2000);