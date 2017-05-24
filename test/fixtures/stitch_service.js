const path = require('path');
const fs = require('fs');
const spawn = require('child_process').spawn;
const { CONF_PATH, STITCH_PATH, BIN_PATH } = require('./constants');
const debug = require('util').debuglog('stitch');

export default class StitchService {
  constructor() {
    // ensure cleanup occurs on process close
    process.on('SIGINT', this.teardown);
    process.on('exit', this.teardown);
  }

  setup() {
    if (process.env.STITCH_URL || !fs.existsSync(STITCH_PATH)) {
      debug('using external stitch process');
      this.externalProcess = true;
      return;
    }

    let config = path.join(CONF_PATH, 'test_config.json');
    let env = Object.assign({}, process.env);
    env.PATH = `${env.PATH}:${BIN_PATH}`;

    return new Promise((resolve, reject) => {
      this.process = spawn(STITCH_PATH, [ '-configFile', config ], { cwd: BIN_PATH, env: env });
      this.process.once('close', (code, signal) => {
        console.log('stitch process closed with code: ', code);
        reject();
      });

      this.process.stderr.on('data', data => debug('stderr: ' + data.toString()));
      this.process.stdout.on('data', (data) => {
        debug('stdout: ' + data.toString());
        if (data.indexOf('Starting combined API & admin API server on') !== -1) {
          this.process.removeAllListeners('close');
          this.process.removeAllListeners('data');
          setTimeout(() => resolve(), 1000);
        }
      });
    });
  }

  teardown() {
    if (this.externalProcess) {
      return;
    }

    if (this.process) {
      this.process.kill('SIGKILL');
      this.process = null;
    }
  }
}
