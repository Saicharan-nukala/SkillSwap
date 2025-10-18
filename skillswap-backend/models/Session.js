// models/Session.js

const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
 // Reference to swap
  swap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Swap',
    required: [true, 'Swap reference is required']
  },

  // Session Details
  title: {
    type: String,
    required: [true, 'Session title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },

  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },

  // Who is teaching in this session
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },

  learner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Learner is required']
  },

  // Scheduling
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },

  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },

  endTime: {
    type: String,
    required: [true, 'End time is required']
  },

  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes']
  },

  // Format and Location
  format: {
    type: String,
    enum: ['online', 'in-person', 'hybrid'],
    default: 'online'
  },

  location: {
    type: String,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },

  // Session Status
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'in-progress'],
    default: 'scheduled'
  },

  // Attendance
  attendance: {
    teacherConfirmed: {
      type: Boolean,
      default: false
    },
    learnerConfirmed: {
      type: Boolean,
      default: false
    }
  },

  // **NEW: Notes Field for references and resources**
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    default: ''
  },

  // **NEW: Rating System**
  rating: {
    // Learner rates the teacher
    teacherRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      feedback: {
        type: String,
        maxlength: [500, 'Feedback cannot exceed 500 characters']
      },
      ratedAt: Date
    },
    // Teacher rates the learner
    learnerRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      feedback: {
        type: String,
        maxlength: [500, 'Feedback cannot exceed 500 characters']
      },
      ratedAt: Date
    }
  },

  // Cancellation
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    cancelledAt: Date
  }

}, {
  timestamps: true
});


// Indexes
sessionSchema.index({ swap: 1, scheduledDate: 1 });
sessionSchema.index({ teacher: 1, status: 1 });
sessionSchema.index({ learner: 1, status: 1 });
sessionSchema.index({ scheduledDate: 1, status: 1 });

// Virtual for session date and time
sessionSchema.virtual('fullDateTime').get(function() {
  return `${this.scheduledDate.toDateString()} ${this.startTime} - ${this.endTime}`;
});

// Method to check if session is upcoming
sessionSchema.methods.isUpcoming = function() {
  return this.scheduledDate > new Date() && this.status === 'scheduled';
};

// Method to check if session is past
sessionSchema.methods.isPast = function() {
  return this.scheduledDate < new Date();
};

// Static method to find upcoming sessions for user
sessionSchema.statics.findUpcomingSessions = function(userId) {
  return this.find({
    $or: [
      { teacher: userId },
      { learner: userId }
    ],
    scheduledDate: { $gte: new Date() },
    status: 'scheduled'
  })
  .populate('teacher learner', 'firstName lastName avatar')
  .populate('swap', 'skillExchange')
  .sort({ scheduledDate: 1 });
};

module.exports = mongoose.model('Session', sessionSchema);
