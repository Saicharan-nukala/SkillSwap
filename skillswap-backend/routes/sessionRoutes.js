// routes/sessionRoutes.js

const express = require('express');
const router = express.Router();
const {
  createSession,
  getSessionsBySwap,
  getSessionById,
  updateSession,
  updateNotes,
  rateSession,
  updateSessionStatus,
  confirmAttendance,
  deleteSession,
  getUserSessions
} = require('../controllers/sessionController');
const protect = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Session CRUD routes
router.post('/', createSession);

router.get('/swap/:swapId', getSessionsBySwap);
router.get('/user', getUserSessions); 
router.get('/:sessionId', getSessionById);
router.put('/:sessionId', updateSession);
router.delete('/:sessionId', deleteSession);

// Session action routes
router.patch('/:sessionId/notes', updateNotes);
router.patch('/:sessionId/rate', rateSession);
router.patch('/:sessionId/status', updateSessionStatus);
router.patch('/:sessionId/attendance', confirmAttendance);

module.exports = router;
