const FinancialRecord = require('../models/FinancialRecord');

/**
 * Build a MongoDB filter object from query params
 */
const buildFilter = (query) => {
  const filter = { isDeleted: false };

  if (query.type) filter.type = query.type;
  if (query.category) filter.category = query.category;

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }

  if (query.minAmount || query.maxAmount) {
    filter.amount = {};
    if (query.minAmount) filter.amount.$gte = parseFloat(query.minAmount);
    if (query.maxAmount) filter.amount.$lte = parseFloat(query.maxAmount);
  }

  return filter;
};

const getAllRecords = async (query) => {
  const filter = buildFilter(query);
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  const sortField = query.sortBy || 'date';
  const sortOrder = query.order === 'asc' ? 1 : -1;

  const [records, total] = await Promise.all([
    FinancialRecord.find(filter)
      .populate('createdBy', 'name email')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit),
    FinancialRecord.countDocuments(filter),
  ]);

  return { records, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
};

const getRecordById = async (id) => {
  return FinancialRecord.findOne({ _id: id, isDeleted: false }).populate('createdBy', 'name email');
};

const createRecord = async (data, userId) => {
  return FinancialRecord.create({ ...data, createdBy: userId });
};

const updateRecord = async (id, data) => {
  return FinancialRecord.findOneAndUpdate(
    { _id: id, isDeleted: false },
    data,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email');
};

const softDeleteRecord = async (id) => {
  return FinancialRecord.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
};

module.exports = { getAllRecords, getRecordById, createRecord, updateRecord, softDeleteRecord };
