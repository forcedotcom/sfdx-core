const {
  updatePackageJson,
  resolvePinoLogger,
  updateLoadMessagesParam,
  addTestSetupToIndex,
} = require('./bundlingUtils');

updatePackageJson();
resolvePinoLogger(true);
updateLoadMessagesParam();
addTestSetupToIndex();
