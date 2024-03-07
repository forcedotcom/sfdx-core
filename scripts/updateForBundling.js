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
      if (packageJson.name && packageJson.name === '@salesforce/core') {
        packageJson.name = '@salesforce/core-bundle';
      }

      // Remove 'prepack' and 'prepare' scripts
      if (packageJson.scripts) {
        delete packageJson.scripts.prepack;
        delete packageJson.scripts.prepare;
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

// Function to update logger.ts
function updateLoggerTs() {
  const loggerPath = './src/logger/logger.ts';

  fs.readFile(loggerPath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading logger.ts: ${err}`);
      return;
    }

    let updatedData = data.replace(
      "target: path.join('..', '..', 'lib', 'logger', 'transformStream')",
      "target: './transformStream'"
    );

    fs.writeFile(loggerPath, updatedData, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error(`Error writing to logger.ts: ${writeErr}`);
      } else {
        console.log('Logger.ts updated successfully.');
      }
    });
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

// Run the update functions
updatePackageJson();
updateLoggerTs();
updateLoadMessagesParam();
