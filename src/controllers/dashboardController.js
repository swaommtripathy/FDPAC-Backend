const dashboardService = require('../services/dashboardService');

// GET /api/dashboard/summary  (All roles)
const getSummary = async (req, res) => {
  try {
    const [summary, recentActivity] = await Promise.all([
      dashboardService.getSummary(),
      dashboardService.getRecentActivity(5),
    ]);
    res.status(200).json({ success: true, data: { summary, recentActivity } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching summary.', error: error.message });
  }
};

// GET /api/dashboard/categories  (Analyst + Admin)
const getCategoryBreakdown = async (req, res) => {
  try {
    const data = await dashboardService.getCategoryBreakdown();
    res.status(200).json({ success: true, data: { categoryBreakdown: data } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching category breakdown.', error: error.message });
  }
};

// GET /api/dashboard/trends/monthly  (Analyst + Admin)
const getMonthlyTrends = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;
    if (months < 1 || months > 24) {
      return res.status(400).json({ success: false, message: 'months query param must be between 1 and 24.' });
    }
    const data = await dashboardService.getMonthlyTrends(months);
    res.status(200).json({ success: true, data: { monthlyTrends: data } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching monthly trends.', error: error.message });
  }
};

// GET /api/dashboard/trends/weekly  (Analyst + Admin)
const getWeeklyTrends = async (req, res) => {
  try {
    const weeks = parseInt(req.query.weeks) || 4;
    if (weeks < 1 || weeks > 12) {
      return res.status(400).json({ success: false, message: 'weeks query param must be between 1 and 12.' });
    }
    const data = await dashboardService.getWeeklyTrends(weeks);
    res.status(200).json({ success: true, data: { weeklyTrends: data } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching weekly trends.', error: error.message });
  }
};

module.exports = { getSummary, getCategoryBreakdown, getMonthlyTrends, getWeeklyTrends };
