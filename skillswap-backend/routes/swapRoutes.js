// routes/swapRoutes.js
const express = require('express');
const router = express.Router();
const {
  createSwapRequest,
  getUserSwaps,
  getSwapById,
  acceptSwapRequest,
  rejectSwapRequest,
  cancelSwap,
  completeSwap,
  addMessageToSwap,
  addReviewToSwap,
  getSwapStats,
  setupSwap,
  markMessagesAsRead
} = require('../controllers/swapController');

const protect = require('../middleware/auth');

// Apply authentication to ALL routes
router.use(protect);
router.get('/', getUserSwaps);

router.post('/', createSwapRequest);
router.get('/stats', getSwapStats);
router.get('/user', getUserSwaps);
router.get('/:id', getSwapById);

// Swap actions
router.put('/:id/accept', acceptSwapRequest);
router.put('/:id/reject', rejectSwapRequest);
router.put('/:id/cancel', cancelSwap);
router.put('/:id/complete', completeSwap);

// Messages and reviews
router.post('/:id/messages', addMessageToSwap);
router.post('/:id/reviews', addReviewToSwap);
router.put('/:id/setup', setupSwap);
router.patch('/:id/messages/read', protect,markMessagesAsRead);

module.exports = router;
