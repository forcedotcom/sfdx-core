const fs = require('fs');

// Path to the directories
const { outputFilesFolder, outputFilesTmpFolder, webOutputFilesTmpFolder } = require('./constants');

// Function to rename a directory
function renameBundledFolder() {
  if (fs.existsSync(outputFilesTmpFolder)) {
    fs.rename(outputFilesTmpFolder, outputFilesFolder, (err) => {
      if (err) {
        return console.error(`Error renaming folder: ${err}`);
      }
      console.log(`Folder renamed from ${outputFilesTmpFolder} to ${outputFilesFolder}`);
    });
  } else {
    console.error(`${outputFilesTmpFolder} does not exist, cannot rename.`);
  }
}

// web was bundled into a temp dir.  copy it to the new lib
const copyWebBundle = () => {
  if (!fs.existsSync(webBundleDir)) {
    throw new Error(`${webBundleDir} does not exist, cannot copy.`);
  }
  const browserDir = `${webOutputFilesTmpFolder}/browser`;
  fs.mkdirSync(browserDir, { recursive: true });
  fs.cpSync(`${webBundleDir}`, browserDir, { filter: (source) => !source.includes('html') });
};

// delete the original compiled files
fs.rmSync(outputFilesFolder, { recursive: true, force: true });
console.log(`${outputFilesFolder} is deleted.`);
renameBundledFolder();
copyWebBundle();
