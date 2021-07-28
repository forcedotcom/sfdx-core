const shell = require('shelljs');

exports.mochaGlobalSetup = async function () {
  console.log('global setup');
  shell.exec(`yarn link`);
};

exports.mochaGlobalTeardown = async function () {
  console.log('global teardown');
  shell.exec(`yarn unlink`);
};
