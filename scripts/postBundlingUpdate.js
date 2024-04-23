const fs = require('fs');
const path = require('path');

// Path to the directories
const CONSTANTS = require('./constants.json');
const outputDir = `./${CONSTANTS.outputFilesFolder}`;
const tmpOutputDir = `./${CONSTANTS.outputFilesTmpFolder}`;

// Function to rename a directory
function renameBundledFolder() {
  if (fs.existsSync(tmpOutputDir)) {
    fs.rename(tmpOutputDir, outputDir, (err) => {
      if (err) {
        return console.error(`Error renaming folder: ${err}`);
      }
      console.log(`Folder renamed from ${tmpOutputDir} to ${outputDir}`);
    });
  } else {
    console.error(`${tmpOutputDir} does not exist, cannot rename.`);
  }
}

// delete the original compiled files
function deleteOriginalLib() {
  if (fs.existsSync(outputDir)) {
    fs.rm(outputDir, { recursive: true, force: true }, (err) => {
      if (err) {
        return console.error(`Error deleting folder: ${err}`);
      }
      console.log(`${outputDir} is deleted.`);
      renameBundledFolder();
    });
  }
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
      "target: './transformStream'",
      "target: path.join('..', '..', 'lib', 'transformStream')"
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

// Start the process
deleteOriginalLib();
updateLoggerTs();
