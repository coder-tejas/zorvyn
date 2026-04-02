const { HttpError } = require('../utils/httpError');

function buildFinancialRecordsService({ prisma, redis }) {
  const listCachePrefix = 'financial_records:list:';
  const itemCachePrefix = 'financial_records:item:';

  async function createRecord(payload) {
    const record = await prisma.financialRecord.create({
      data: {
        amount: payload.amount,
        type: payload.type,
        category: payload.category,
        recordDate: new Date(payload.recordDate),
        notes: payload.notes || null
      }
    });

    await invalidateListCache();
    await cacheItem(record);
    return record;
  }

  async function listRecords(filters) {
    const cacheKey = `${listCachePrefix}${JSON.stringify(filters)}`;
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const where = {
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...((filters.startDate || filters.endDate)
        ? {
            recordDate: {
              ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
              ...(filters.endDate ? { lte: new Date(filters.endDate) } : {})
            }
          }
        : {})
    };

    const skip = (filters.page - 1) * filters.pageSize;
    const take = filters.pageSize;

    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        orderBy: { recordDate: 'desc' },
        skip,
        take
      }),
      prisma.financialRecord.count({ where })
    ]);

    const result = {
      pagination: {
        page: filters.page,
        pageSize: filters.pageSize,
        total
      },
      data: records
    };

    if (redis) {
      await redis.set(cacheKey, JSON.stringify(result), { EX: 60 });
    }

    return result;
  }

  async function getRecordById(id) {
    const cacheKey = `${itemCachePrefix}${id}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const record = await prisma.financialRecord.findUnique({ where: { id } });
    if (!record) {
      throw new HttpError(404, 'Financial record not found');
    }

    await cacheItem(record);
    return record;
  }

  async function updateRecord(id, payload) {
    const existing = await prisma.financialRecord.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, 'Financial record not found');
    }

    const updated = await prisma.financialRecord.update({
      where: { id },
      data: {
        ...(payload.amount !== undefined ? { amount: payload.amount } : {}),
        ...(payload.type ? { type: payload.type } : {}),
        ...(payload.category ? { category: payload.category } : {}),
        ...(payload.recordDate ? { recordDate: new Date(payload.recordDate) } : {}),
        ...(payload.notes !== undefined ? { notes: payload.notes } : {})
      }
    });

    await invalidateListCache();
    await cacheItem(updated);
    return updated;
  }

  async function deleteRecord(id) {
    const existing = await prisma.financialRecord.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, 'Financial record not found');
    }

    await prisma.financialRecord.delete({ where: { id } });

    await invalidateListCache();
    if (redis) {
      await redis.del(`${itemCachePrefix}${id}`);
    }

    return { id };
  }

  async function invalidateListCache() {
    if (!redis) return;
    const keys = await redis.keys(`${listCachePrefix}*`);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }

  async function cacheItem(record) {
    if (!redis || !record) return;
    await redis.set(`${itemCachePrefix}${record.id}`, JSON.stringify(record), { EX: 60 });
  }

  return {
    createRecord,
    listRecords,
    getRecordById,
    updateRecord,
    deleteRecord
  };
}

module.exports = {
  buildFinancialRecordsService
};
