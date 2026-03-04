import 'dotenv/config'
import logger from './utils/logger.js';
import { ENV } from './configs/env.js';
import app from './app.js';

app.listen(ENV.PORT ?? 5000, () => {
  logger.info({ port: ENV.PORT ?? 5000 }, 'Server started');
});
