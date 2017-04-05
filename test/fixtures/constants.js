const path = require('path');

const BIN_PATH = path.join(__dirname, '..', 'bin');
const CONF_PATH = path.join(__dirname, '..', 'conf');
const BAAS_PATH = path.join(BIN_PATH, 'baas_server');
const DEFAULT_URI = 'mongodb://localhost:27017/test';

module.exports = { BIN_PATH, CONF_PATH, BAAS_PATH, DEFAULT_URI };
