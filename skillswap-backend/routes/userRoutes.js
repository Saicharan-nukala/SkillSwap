// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth'); // ✅ CORRECT - Import auth middleware

// Protected routes - now properly protected
router.get('/:id', auth, userController.getUserProfile);
router.put('/:id', auth, userController.updateUserProfile);

module.exports = router;