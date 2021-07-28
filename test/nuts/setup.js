const shell = require('shelljs');

// mocha global setup/teardown run before and after all tests.  https://mochajs.org/#global-fixtures
exports.mochaGlobalSetup = async function () {
  console.log('global setup');
  shell.exec(`yarn link`);
};

exports.mochaGlobalTeardown = async function () {
  console.log('global teardown');
  shell.exec(`yarn unlink`);
};
