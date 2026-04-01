const { body, param } = require('express-validator');
const User = require('../models/User');
const handleValidationErrors = require('../middleware/validate');

// Validation
const updateRoleValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('role').isIn(['viewer', 'analyst', 'admin']).withMessage('Role must be viewer, analyst, or admin'),
  handleValidationErrors,
];

// GET /api/users  (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: { users, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users.', error: error.message });
  }
};

// GET /api/users/:id  (Admin only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user.', error: error.message });
  }
};

// PATCH /api/users/:id/role  (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Admins cannot change their own role.' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, message: `Role updated to ${role}.`, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating role.', error: error.message });
  }
};

// PATCH /api/users/:id/status  (Admin only)
const toggleUserStatus = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Admins cannot deactivate their own account.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { user: { id: user._id, name: user.name, email: user.email, isActive: user.isActive } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user status.', error: error.message });
  }
};

module.exports = { getAllUsers, getUserById, updateUserRole, toggleUserStatus, updateRoleValidation };
