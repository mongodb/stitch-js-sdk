const path = require('path');

const BIN_PATH = path.join(__dirname, '..', 'bin');
const CONF_PATH = path.join(__dirname, '..', 'conf');
const STITCH_PATH = path.join(BIN_PATH, 'stitch_server');
const DEFAULT_URI = 'mongodb://localhost:27017/test';

module.exports = { BIN_PATH, CONF_PATH, STITCH_PATH, DEFAULT_URI };
