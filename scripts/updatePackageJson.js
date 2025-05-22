const fs = require('fs');

// Function to update package.json
function updatePackageJson() {
  const packagePath = './package.json';

  fs.readFile(packagePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading package.json: ${err}`);
      return;
    }

    try {
      const packageJson = JSON.parse(data);

      // Update package name if necessary
      if (packageJson?.name === '@salesforce/core') {
        packageJson.name = '@salesforce/core-bundle';
      }

      packageJson.browser = 'dist/browser/index.js';
      packageJson.main = 'dist/index.js';
      packageJson.types = 'dist/node/index.d.ts';
      packageJson.files = ['dist'];

      // Remove 'prepack' and 'prepare' scripts because publishing bundle does not need the actions
      if (packageJson.scripts) {
        delete packageJson.scripts.prepack;
        delete packageJson.scripts.prepare;
      }

      // Remove 'exports' because there is only one entry file in the bundle. Redirecting the paths for core-bundle will cause mess.
      if (packageJson.exports) {
        delete packageJson.exports;
      }

      fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2), 'utf8', (writeErr) => {
        if (writeErr) {
          console.error(`Error writing to package.json: ${writeErr}`);
        } else {
          console.log('package.json updated successfully.');
        }
      });
    } catch (parseErr) {
      console.error(`Error parsing JSON in package.json: ${parseErr}`);
    }
  });
}

exports.updatePackageJson = updatePackageJson;
