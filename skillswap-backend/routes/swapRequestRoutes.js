// routes/swapRequestRoutes.js

const express = require('express');
const router = express.Router();
const {
  createRequest,
  getAllRequests,
  respondToRequest,
  getMyRequests,      // NEW
  acceptResponse      // NEW
} = require('../controllers/swapRequestController');
const protect = require('../middleware/auth');

router.use(protect);

router.post('/', createRequest);
router.get('/', getAllRequests);
router.get('/my-requests', getMyRequests);  // NEW
router.post('/:id/respond', respondToRequest);
router.post('/:id/accept-response', acceptResponse);  // NEW

module.exports = router;
