const express = require('express');
const router = express.Router();
const { getSummary, getCategoryBreakdown, getMonthlyTrends, getWeeklyTrends } = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.use(authenticate);

// Summary: all roles
router.get('/summary', getSummary);

// Detailed analytics: analyst and admin only
router.get('/categories', authorize('analyst', 'admin'), getCategoryBreakdown);
router.get('/trends/monthly', authorize('analyst', 'admin'), getMonthlyTrends);
router.get('/trends/weekly', authorize('analyst', 'admin'), getWeeklyTrends);

module.exports = router;
