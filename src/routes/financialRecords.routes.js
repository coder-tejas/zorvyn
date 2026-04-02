const express = require('express');
const {
  createFinancialRecordSchema,
  updateFinancialRecordSchema,
  listFinancialRecordQuerySchema
} = require('../validation/financialRecords');

function createFinancialRecordsRouter(service) {
  const router = express.Router();

  router.post('/', async (req, res, next) => {
    try {
      const payload = createFinancialRecordSchema.parse(req.body);
      const record = await service.createRecord(payload);
      return res.status(201).json({ data: record });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/', async (req, res, next) => {
    try {
      const filters = listFinancialRecordQuerySchema.parse(req.query);
      const result = await service.listRecords(filters);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const record = await service.getRecordById(req.params.id);
      return res.status(200).json({ data: record });
    } catch (error) {
      return next(error);
    }
  });

  router.patch('/:id', async (req, res, next) => {
    try {
      const payload = updateFinancialRecordSchema.parse(req.body);
      const record = await service.updateRecord(req.params.id, payload);
      return res.status(200).json({ data: record });
    } catch (error) {
      return next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const result = await service.deleteRecord(req.params.id);
      return res.status(200).json({ data: result });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

module.exports = {
  createFinancialRecordsRouter
};
