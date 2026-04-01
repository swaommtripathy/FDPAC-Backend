const { body, param } = require('express-validator');
const recordService = require('../services/recordService');
const handleValidationErrors = require('../middleware/validate');

const VALID_CATEGORIES = ['salary','freelance','investment','rent','utilities','food','transport','healthcare','entertainment','education','other'];

// Validation rules
const createRecordValidation = [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  handleValidationErrors,
];

const updateRecordValidation = [
  param('id').isMongoId().withMessage('Invalid record ID'),
  body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').optional().isIn(VALID_CATEGORIES).withMessage(`Invalid category`),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes too long'),
  handleValidationErrors,
];

// GET /api/records
const getAllRecords = async (req, res) => {
  try {
    const result = await recordService.getAllRecords(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching records.', error: error.message });
  }
};

// GET /api/records/:id
const getRecordById = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid record ID format.' });
    }
    const record = await recordService.getRecordById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    res.status(200).json({ success: true, data: { record } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching record.', error: error.message });
  }
};

// POST /api/records
const createRecord = async (req, res) => {
  try {
    const record = await recordService.createRecord(req.body, req.user._id);
    res.status(201).json({ success: true, message: 'Record created successfully.', data: { record } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating record.', error: error.message });
  }
};

// PUT /api/records/:id
const updateRecord = async (req, res) => {
  try {
    const record = await recordService.updateRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    res.status(200).json({ success: true, message: 'Record updated successfully.', data: { record } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating record.', error: error.message });
  }
};

// DELETE /api/records/:id  (Soft delete)
const deleteRecord = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid record ID format.' });
    }
    const record = await recordService.softDeleteRecord(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    res.status(200).json({ success: true, message: 'Record deleted successfully (soft delete).' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting record.', error: error.message });
  }
};

module.exports = { getAllRecords, getRecordById, createRecord, updateRecord, deleteRecord, createRecordValidation, updateRecordValidation };
