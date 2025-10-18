// controllers/sessionController.js - COMPLETE VERSION WITH NEW FEATURES

const Session = require('../models/Session');
const Swap = require('../models/Swap');

// Create session
exports.createSession = async (req, res) => {
  try {
    const {
      swap,
      title,
      scheduledDate,
      startTime,
      endTime,
      duration,
      format,
      location,
      description
    } = req.body;

    // Verify swap exists
    const swapDoc = await Swap.findById(swap);
    if (!swapDoc) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // Check if user is participant
    const userId = req.user._id.toString();
    const isParticipant = swapDoc.requester.toString() === userId ||
                         swapDoc.receiver.toString() === userId;
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Determine teacher and learner
    const isRequester = swapDoc.requester.toString() === userId;
    const teacher = req.user._id;
    const learner = isRequester ? swapDoc.receiver : swapDoc.requester;

    const session = await Session.create({
      swap,
      title,
      description,
      teacher,
      learner,
      scheduledDate,
      startTime,
      endTime,
      duration,
      format,
      location
    });

    const populatedSession = await Session.findById(session._id)
      .populate('teacher', 'name email')
      .populate('learner', 'name email');

    res.status(201).json({
      success: true,
      data: populatedSession
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all sessions for a swap
exports.getSessionsBySwap = async (req, res) => {
  try {
    const { swapId } = req.params;
    
    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    const userId = req.user._id.toString();
    const isParticipant = swap.requester.toString() === userId ||
                         swap.receiver.toString() === userId;
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const sessions = await Session.find({ swap: swapId })
      .populate('teacher', 'name email')
      .populate('learner', 'name email')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
// Get all sessions for current user (both teaching and learning)
exports.getUserSessions = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all sessions where user is either teacher or learner
    const sessions = await Session.find({
      $or: [
        { teacher: userId },
        { learner: userId }
      ]
    })
      .populate('teacher', 'name email profileImage')
      .populate('learner', 'name email profileImage')
      .populate('swap')
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await Session.findById(sessionId)
      .populate('teacher', 'name email profileImage')
      .populate('learner', 'name email profileImage')
      .populate('swap');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check authorization
    const userId = req.user._id.toString();
    const isTeacher = session.teacher._id.toString() === userId;
    const isLearner = session.learner._id.toString() === userId;
    
    if (!isTeacher && !isLearner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this session'
      });
    }

    // Add user role to response
    res.status(200).json({
      success: true,
      data: session,
      userRole: isTeacher ? 'teacher' : 'learner'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// **NEW: Update session details (only teacher can edit)**
exports.updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const updates = req.body;

    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Only teacher can edit session
    const userId = req.user._id.toString();
    if (session.teacher.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the teacher can edit session details'
      });
    }

    // Prevent editing completed or cancelled sessions
    if (session.status === 'completed' || session.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit ${session.status} sessions`
      });
    }

    // Allowed fields to update
    const allowedUpdates = ['title', 'description', 'scheduledDate', 'startTime', 
                           'endTime', 'duration', 'format', 'location'];
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        session[key] = updates[key];
      }
    });

    await session.save();

    const updatedSession = await Session.findById(sessionId)
      .populate('teacher', 'name email')
      .populate('learner', 'name email');

    res.status(200).json({
      success: true,
      data: updatedSession
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// **NEW: Update session notes (both teacher and learner can add)**
exports.updateNotes = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { notes } = req.body;

    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check authorization (both can add notes)
    const userId = req.user._id.toString();
    const isTeacher = session.teacher.toString() === userId;
    const isLearner = session.learner.toString() === userId;
    
    if (!isTeacher && !isLearner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    session.notes = notes;
    await session.save();

    res.status(200).json({
      success: true,
      data: session
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// **NEW: Rate session (teacher rates learner, learner rates teacher)**
exports.rateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { rating, feedback } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Can only rate completed sessions
    if (session.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed sessions'
      });
    }

    const userId = req.user._id.toString();
    const isTeacher = session.teacher.toString() === userId;
    const isLearner = session.learner.toString() === userId;
    
    if (!isTeacher && !isLearner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Teacher rates learner
    if (isTeacher) {
      if (session.rating.learnerRating && session.rating.learnerRating.rating) {
        return res.status(400).json({
          success: false,
          message: 'You have already rated this learner'
        });
      }
      
      session.rating.learnerRating = {
        rating,
        feedback: feedback || '',
        ratedAt: new Date()
      };
    }
    
    // Learner rates teacher
    if (isLearner) {
      if (session.rating.teacherRating && session.rating.teacherRating.rating) {
        return res.status(400).json({
          success: false,
          message: 'You have already rated this teacher'
        });
      }
      
      session.rating.teacherRating = {
        rating,
        feedback: feedback || '',
        ratedAt: new Date()
      };
    }

    await session.save();

    res.status(200).json({
      success: true,
      data: session,
      message: 'Rating submitted successfully'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update session status
// Update session status
exports.updateSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status, reason } = req.body;

    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const userId = req.user._id.toString();
    const isTeacher = session.teacher.toString() === userId;
    const isLearner = session.learner.toString() === userId;
    
    if (!isTeacher && !isLearner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Only teacher can mark as completed or cancel
    if ((status === 'completed' || status === 'cancelled') && !isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Only teacher can update session status'
      });
    }

    // **NEW: Check if both parties have confirmed attendance before marking complete**
    if (status === 'completed') {
      session.attendance.teacherConfirmed=true;
      if (!session.attendance.teacherConfirmed || !session.attendance.learnerConfirmed) {
        return res.status(400).json({
          success: false,
          message: 'Learner must confirm attendance before marking session as complete'
        });
      }
    }

    session.status = status;

    if (status === 'cancelled') {
      session.cancellation = {
        cancelledBy: req.user._id,
        reason: reason || 'No reason provided',
        cancelledAt: new Date()
      };
    }

    await session.save();

    const updatedSession = await Session.findById(sessionId)
      .populate('teacher', 'name email')
      .populate('learner', 'name email');

    res.status(200).json({
      success: true,
      data: updatedSession
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// Confirm attendance
exports.confirmAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const userId = req.user._id.toString();
    const isTeacher = session.teacher.toString() === userId;
    const isLearner = session.learner.toString() === userId;
    
    if (!isTeacher && !isLearner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (isTeacher) {
      session.attendance.teacherConfirmed = true;
    }
    
    if (isLearner) {
      session.attendance.learnerConfirmed = true;
    }

    await session.save();

    res.status(200).json({
      success: true,
      data: session
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete session
exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const userId = req.user._id.toString();
    if (session.teacher.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only teacher can delete session'
      });
    }

    await Session.findByIdAndDelete(sessionId);

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
