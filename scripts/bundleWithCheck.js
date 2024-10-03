const { exec } = require('child_process');

const commandToRun = 'yarn build && node ./scripts/build.js';

// Run the command
exec(commandToRun, (error, stdout, stderr) => {
  // Combine stdout and stderr to check the entire output
  const output = `${stdout}\n${stderr}`;
  // Check if the output contains the error string of esbuild
  if (output.includes('[require-resolve-not-external]')) {
    console.error('Error: A dependency that has to be externalized in esbuild process is found. Please resolve it!');
    process.exit(1); // Exit with an error code
  } else {
    process.exit(0); // Exit with success code
  }
});
