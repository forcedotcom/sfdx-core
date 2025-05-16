const fs = require('fs');

// Path to the directories
const { outputFilesFolder, outputFilesTmpFolder, webOutputFilesTmpFolder } = require('./constants');

// Function to rename a directory
function renameBundledFolder() {
  if (fs.existsSync(outputFilesTmpFolder)) {
    fs.renameSync(outputFilesTmpFolder, outputFilesFolder);
    console.log(`Folder renamed from ${outputFilesTmpFolder} to ${outputFilesFolder}`);
  } else {
    console.error(`${outputFilesTmpFolder} does not exist, cannot rename.`);
  }
}

// web was bundled into a temp dir.  copy it to the new lib
const copyWebBundle = () => {
  if (!fs.existsSync(webOutputFilesTmpFolder)) {
    throw new Error(`${webOutputFilesTmpFolder} does not exist, cannot copy.`);
  }
  const browserDir = `${outputFilesTmpFolder}/browser`;

  fs.mkdirSync(browserDir, { recursive: true });
  fs.cpSync(`${webOutputFilesTmpFolder}`, browserDir, {
    filter: (source) => !source.includes('html'),
    recursive: true,
  });
};

// delete the original compiled files
fs.rmSync(outputFilesFolder, { recursive: true, force: true });
console.log(`${outputFilesFolder} is deleted.`);
copyWebBundle();
renameBundledFolder();
