const { z } = require('zod');

const recordTypeSchema = z.enum(['income', 'expense']);

const createFinancialRecordSchema = z.object({
  amount: z.number().positive('amount must be greater than zero'),
  type: recordTypeSchema,
  category: z.string().min(1).max(100),
  recordDate: z.string().datetime(),
  notes: z.string().max(500).optional().nullable()
});

const updateFinancialRecordSchema = createFinancialRecordSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  'at least one field must be provided for update'
);

const listFinancialRecordQuerySchema = z.object({
  type: recordTypeSchema.optional(),
  category: z.string().min(1).max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});

module.exports = {
  createFinancialRecordSchema,
  updateFinancialRecordSchema,
  listFinancialRecordQuerySchema
};
