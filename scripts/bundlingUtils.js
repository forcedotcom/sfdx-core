const fs = require('fs');
const path = require('path');

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

      packageJson.browser = 'lib/browser';
      packageJson.main = 'lib/index.js';

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

// make sure the path to transformStream is not changed, and update the logger path by input
function resolvePinoLogger(updateLoggerPath) {
  const loggerPath = './src/logger/logger.ts';
  const targetString = "target: path.join('..', '..', 'lib', 'logger', 'transformStream')";
  const replacementString = "target: './transformStream'";

  fs.readFile(loggerPath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading logger.ts: ${err}`);
      return;
    }
    // Check if the target string exists in the file
    if (!data.includes(targetString)) {
      console.error(
        `Error: The target string "${targetString}" was not found in logger.ts.\n Please make sure to bundle transformStream by referencing the new path or reach out to IDEx Foundations Team.`
      );
      return;
    }
    if (updateLoggerPath) {
      let updatedData = data.replace(targetString, replacementString);
      fs.writeFile(loggerPath, updatedData, 'utf8', (writeErr) => {
        if (writeErr) {
          console.error(`Error writing to logger.ts: ${writeErr}`);
        } else {
          console.log('Logger.ts updated successfully.');
        }
      });
    }
  });
}

function updateLoadMessagesParam() {
  const dirs = ['./src', './test'];
  function replaceTextInFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    const result = data.replace(
      /Messages\.loadMessages\('@salesforce\/core'/g,
      "Messages.loadMessages('@salesforce/core-bundle'"
    );
    fs.writeFileSync(filePath, result, 'utf8');
  }
  function traverseDirectory(directory) {
    fs.readdirSync(directory).forEach((file) => {
      const fullPath = path.join(directory, file);
      if (fs.lstatSync(fullPath).isDirectory()) {
        traverseDirectory(fullPath);
      } else if (path.extname(fullPath) === '.ts') {
        replaceTextInFile(fullPath);
      }
    });
  }
  dirs.forEach((dir) => {
    traverseDirectory(dir);
  });
}

function addTestSetupToIndex() {
  const indexPath = './src/index.ts';
  const testSetupExport = "export * from './testSetup';\n";
  fs.readFile(indexPath, 'utf8', (err, data) => {
    fs.appendFile(indexPath, testSetupExport, 'utf8', (err) => {
      if (err) {
        console.error(`Error appending to file: ${err}`);
      } else {
        console.log('Content successfully added to the file.');
      }
    });
  });
}

exports.updatePackageJson = updatePackageJson;
exports.resolvePinoLogger = resolvePinoLogger;
exports.updateLoadMessagesParam = updateLoadMessagesParam;
exports.addTestSetupToIndex = addTestSetupToIndex;
