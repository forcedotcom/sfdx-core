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

// Start the process
deleteOriginalLib();
