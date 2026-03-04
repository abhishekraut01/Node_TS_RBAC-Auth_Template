import type { Application, NextFunction, Request, Response } from 'express';
import express from 'express';
import cookieParser from 'cookie-parser';
import errorHandler from './middlewares/globalErrorHandler.middleware.js';
import { requestLogger } from './middlewares/requestLogger.middleware.js';
import apiRouter from './routes/index.routes.js';
import { ApiResponse } from './utils/apiResponse.js';
import { ENV } from './configs/env.js';
import cors from 'cors';

const app: Application = express();

app.set('trust proxy', 1);

const ALLOWED_ORIGINS =
  ENV.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) || [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // wildcard check
      if (ENV.ALLOWED_ORIGINS === '*') return callback(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        console.error(
          `CORS Blocked: Origin ${origin} not in [${ALLOWED_ORIGINS.join(', ')}]`
        );
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
    optionsSuccessStatus: 200,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(requestLogger);

app.use('/api/v1', apiRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json(new ApiResponse(404, 'Route Not Found'));
});

app.use(errorHandler);

export default app;
