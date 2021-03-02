import * as dotenv from 'dotenv';
dotenv.config();
import * as http from 'http';
import config from './config';

const expressApp = require('./app');
const server = http.createServer();

// Mount the express app here
server.on('request', expressApp);

// Start server
server.listen(config.port, () => {
  console.info('Stage:', config.stage);
  console.info(`SERVER IS RUNNING AT PORT ${config.port}`);
});