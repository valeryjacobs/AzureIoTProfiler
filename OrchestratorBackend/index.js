const Api = require('kubernetes-client');
const JSONStream = require('json-stream');
const jsonStream = new JSONStream();

const core = new Api.Core({
  url: 'http://127.0.0.1:8001',
  insecureSkipTlsVerify: true,
  auth: {
    user: 'primkey',
    pass: 'xdb4A2xRI+NZLbsd7y/kYvV2cudas1TvJFVFXl285p0='
  }
});



 
const stream = core.ns.po.get({ qs: { watch: true } });
stream.pipe(jsonStream);
jsonStream.on('data', object => {
  console.log('Pod:', JSON.stringify(object, null, 2));
});


function print(err, result) {
  console.log(JSON.stringify(err || result, null, 2));
}



//ext.namespaces.deployments('devicesimulator').get(print);

core.ns.rc.po.get(print);

core.name

