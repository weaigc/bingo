const { existsSync } = require('fs');
const { spawn } = require('child_process');

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, { shell: true });

    child.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    child.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    child.on('exit', (code) => {
      console.log(`Child process exited with code ${code}`);
      resolve();
    });

    child.on('error', (err) => {
      console.error(err);
      reject(err);
    });
  });
}

async function start() {
  let exists = false;
  try {
    exists = existsSync('.next/BUILD_ID');
  } catch (e) {}
  if (!exists) {
    await executeCommand('npm install');
    await executeCommand('npm run build');
  }
}
start();
