const express = require('express');
const router = express.Router();
const {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
  createRecordValidation,
  updateRecordValidation,
} = require('../controllers/recordController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

// All routes require authentication
router.use(authenticate);

// Read: all roles can view records
router.get('/', getAllRecords);
router.get('/:id', getRecordById);

// Create: analyst and admin can create
router.post('/', authorize('analyst', 'admin'), createRecordValidation, createRecord);

// Update/Delete: admin only
router.put('/:id', authorize('admin'), updateRecordValidation, updateRecord);
router.delete('/:id', authorize('admin'), deleteRecord);

module.exports = router;
