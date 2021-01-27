const { exec } = require('child_process');

async function sh(cmd) {
  return new Promise(function (resolve, reject) {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        resolve(stderr);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

/**
 *
 * @param {String} language Having 3 languages: Cpp, JavaScript, Python (Case insensitive !)
 */
const main = async (language) => {
  let path,
    imgName,
    flag = true;
  switch (language.toLowerCase()) {
    case 'cpp':
      path = './Cpp';
      imgName = 'cpp-runner';
      break;
    case 'javascript':
      path = './JavaScript';
      imgName = 'javascript-runner';
      await sh(`cd ${path} && npm init -y && cd ..`);
      break;
    case 'python':
      path = './Python';
      imgName = 'python-runner';
      await sh(`pipreqs --force ${path}`);
      break;
    default:
      flag = false;
  }
  if (flag) {
    await sh(`docker build -t ${imgName} ${path}`);
    let { stdout } = await sh(`docker run ${imgName}`);
    console.log(stdout);

    console.log(
      'CONTAINER PRUNE: ' + (await sh('docker container prune -f')).stdout,
    );
    console.log('IMAGE PRUNE: ' + (await sh('docker image prune -f')).stdout);
    console.log('VOLUME PRUNE: ' + (await sh('docker volume prune -f')).stdout);
  } else {
    console.log('Unknown language found !');
  }

  switch (language.toLowerCase()) {
    case 'python':
      await sh(`rm -f ${path}/requirements.txt`);
      break;
    case 'javascript':
      await sh(`rm -rf ${path}/package*.json node_modules/`);
      break;
  }

};

main('javascript');
