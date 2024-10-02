const {
  updatePackageJson,
  checkTransformStreamPath,
  updateLoggerTs,
  updateLoadMessagesParam,
  addTestSetupToIndex,
} = require('./bundlingUtils');

updatePackageJson();
checkTransformStreamPath();
updateLoggerTs();
updateLoadMessagesParam();
addTestSetupToIndex();
