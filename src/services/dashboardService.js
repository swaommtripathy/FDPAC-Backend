const FinancialRecord = require('../models/FinancialRecord');

/**
 * Returns overall financial summary
 */
const getSummary = async () => {
  const result = await FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = { totalIncome: 0, totalExpenses: 0, incomeCount: 0, expenseCount: 0 };
  result.forEach((r) => {
    if (r._id === 'income') {
      summary.totalIncome = r.total;
      summary.incomeCount = r.count;
    } else if (r._id === 'expense') {
      summary.totalExpenses = r.total;
      summary.expenseCount = r.count;
    }
  });

  summary.netBalance = summary.totalIncome - summary.totalExpenses;
  summary.totalRecords = summary.incomeCount + summary.expenseCount;

  return summary;
};

/**
 * Returns totals grouped by category
 */
const getCategoryBreakdown = async () => {
  return FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { type: '$type', category: '$category' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    {
      $group: {
        _id: '$_id.type',
        categories: {
          $push: { category: '$_id.category', total: '$total', count: '$count' },
        },
      },
    },
  ]);
};

/**
 * Returns monthly income vs expense trend
 */
const getMonthlyTrends = async (months = 6) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  return FinancialRecord.aggregate([
    { $match: { isDeleted: false, date: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $group: {
        _id: { year: '$_id.year', month: '$_id.month' },
        entries: { $push: { type: '$_id.type', total: '$total', count: '$count' } },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        entries: 1,
      },
    },
  ]);
};

/**
 * Returns recent N records
 */
const getRecentActivity = async (limit = 5) => {
  return FinancialRecord.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('createdBy', 'name');
};

/**
 * Returns weekly totals for the last N weeks
 */
const getWeeklyTrends = async (weeks = 4) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);

  return FinancialRecord.aggregate([
    { $match: { isDeleted: false, date: { $gte: startDate } } },
    {
      $group: {
        _id: {
          week: { $isoWeek: '$date' },
          year: { $isoWeekYear: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
  ]);
};

module.exports = { getSummary, getCategoryBreakdown, getMonthlyTrends, getRecentActivity, getWeeklyTrends };
