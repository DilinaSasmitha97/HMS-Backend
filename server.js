const connectDB = require('./config/db');
const config = require('./config');
const logger = require('./utils/logger');
const app = require('./app');

connectDB();

const server = app.listen(config.port, () =>
    logger.info(`Server running on port ${config.port}. API available at http://localhost:${config.port}`)
);

module.exports = { app, server };
