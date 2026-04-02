const express = require('express');
const { ZodError } = require('zod');
const { Prisma } = require('@prisma/client');
const { createFinancialRecordsRouter } = require('./routes/financialRecords.routes');
const { buildFinancialRecordsService } = require('./services/financialRecords.service');
const { HttpError } = require('./utils/httpError');

function createApp({ prisma, redis }) {
  const app = express();
  const financialService = buildFinancialRecordsService({ prisma, redis });

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/financial-records', createFinancialRecordsRouter(financialService));

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.use((err, _req, res, _next) => {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        details: err.issues
      });
    }

    if (err instanceof HttpError) {
      return res.status(err.statusCode).json({
        message: err.message,
        details: err.details || null
      });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(400).json({
        message: 'Database request failed',
        code: err.code
      });
    }

    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  });

  return app;
}

module.exports = {
  createApp
};
