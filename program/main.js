const { startWalletMonitor } = require('./monitor/monitor');

//connect to the database
require('./database/connection');

startWalletMonitor();
