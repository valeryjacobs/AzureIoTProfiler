'use strict';

var iothub = require('azure-iothub');

var connectionString = 'HostName=vjiot.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=vRfp4qjgbqtS7oCm2DE5g/iU+mJpMjHCtzlglxq+XVM=';

var registry = iothub.Registry.fromConnectionString(connectionString);


// pLwiv8chaNjIesQL0sNVoReBk1g+276Ao6TUUpYTQUI=

for (var i = 0; i < 5; i++) {

  var device = new iothub.Device(null);
  device.deviceId = 'Device' + i;

  // var waitTill = new Date(new Date().getTime() + 100);
  // while (waitTill > new Date()) {

  // }


  registry.create(device, function (err, deviceInfo, res) {
    if (err) {
      registry.get(device.deviceId, printDeviceInfo);
    }
    if (deviceInfo) {
      printDeviceInfo(err, deviceInfo, res)
    }
  });
}

function printDeviceInfo(err, deviceInfo, res) {
  if (deviceInfo) {
    console.log('Device ID: ' + deviceInfo.deviceId);
    console.log('Device key: ' + deviceInfo.authentication.symmetricKey.primaryKey);
  }
}
