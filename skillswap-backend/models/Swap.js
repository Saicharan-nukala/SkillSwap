const mongoose = require('mongoose');
const swapSchema = new mongoose.Schema({
  // Participants
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester is required']
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver is required']
  },

  // Skill Exchange Details
  skillExchange: {
    // What requester offers to teach
    requesterOffering: {
      skillName: {
        type: String,
        required: [true, 'Requester skill offering is required'],
        trim: true
      },
      category: String,
      experienceLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
      },
      description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
      },
      totalSessions: {
        type: Number,
        default: 0,
        min: [0, 'Total sessions cannot be negative']
      }
    },
    // What receiver offers to teach
    receiverOffering: {
      skillName: {
        type: String,
        required: [true, 'Receiver skill offering is required'],
        trim: true
      },
      category: String,
      experienceLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
      },
      description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
      },
      totalSessions: {
        type: Number,
        default: 0,
        min: [0, 'Total sessions cannot be negative']
      }
    }
  },

  // Swap Status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },

  // Learning Preferences
  preferences: {
    format: {
      type: String,
      enum: ['online', 'offline', 'both'],
      default: 'both'
    },
    sessionDuration: {
      type: Number,
      default: 60
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'flexible'],
      default: 'weekly'
    },
    location: String,
    timezone: String
  },

  // Sessions Array
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }],

  // Progress Tracking
  progress: {
    requesterProgress: {
      completedSessions: { type: Number, default: 0 },
      milestones: [String],
      notes: String
    },
    receiverProgress: {
      completedSessions: { type: Number, default: 0 },
      milestones: [String],
      notes: String
    }
  },

  // Communication
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }],

  // Ratings and Reviews
  reviews: {
    requesterReview: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: [500, 'Review cannot exceed 500 characters']
      },
      reviewedAt: Date
    },
    receiverReview: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: [500, 'Review cannot exceed 500 characters']
      },
      reviewedAt: Date
    }
  },

  // Metadata
  startDate: Date,
  endDate: Date,
  completedAt: Date,

  // Compatibility Score
  compatibilityScore: {
    type: Number,
    min: 0,
    max: 100
  },

  // Notes
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },

  // Cancellation Reason
  cancellationReason: {
    type: String,
    maxlength: [300, 'Cancellation reason cannot exceed 300 characters']
  }
}, {
  timestamps: true
});

// Indexes
swapSchema.index({ requester: 1, status: 1 });
swapSchema.index({ receiver: 1, status: 1 });
swapSchema.index({ status: 1, createdAt: -1 });
swapSchema.index({ 'skillExchange.requesterOffering.skillName': 1 });
swapSchema.index({ 'skillExchange.receiverOffering.skillName': 1 });

swapSchema.virtual('durationDays').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Method to check if user is participant
swapSchema.methods.isParticipant = function(userId) {
  const userIdStr = userId.toString();
  const requesterId = this.requester._id ? this.requester._id.toString() : this.requester.toString();
  const receiverId = this.receiver._id ? this.receiver._id.toString() : this.receiver.toString();
  return requesterId === userIdStr || receiverId === userIdStr;
};

// Method to get other participant
swapSchema.methods.getOtherParticipant = function(userId) {
  return this.requester.toString() === userId.toString()
    ? this.receiver
    : this.requester;
};
swapSchema.methods.getTotalSessionsForTeacher = function(teacherId) {
  const teacherIdStr = teacherId.toString();
  const requesterIdStr = this.requester._id ? this.requester._id.toString() : this.requester.toString();
  
  if (requesterIdStr === teacherIdStr) {
    return this.skillExchange.requesterOffering.totalSessions || 0;
  } else {
    return this.skillExchange.receiverOffering.totalSessions || 0;
  }
};

// Method to add message
swapSchema.methods.addMessage = function(senderId, content) {
  this.messages.push({
    sender: senderId,
    content: content,
    timestamp: new Date(),
    read: false
  });
  return this.save();
};

// Method to mark messages as read
swapSchema.methods.markMessagesAsRead = function(userId) {
  this.messages.forEach(msg => {
    if (msg.sender.toString() !== userId.toString()) {
      msg.read = true;
    }
  });
  return this.save();
};

// Pre-save middleware
swapSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'accepted' && !this.startDate) {
    this.startDate = new Date();
  }

  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
    this.endDate = new Date();
  }

  next();
});

// Static method to find swaps by user
swapSchema.statics.findByUser = function(userId, status = null) {
  const query = {
    $or: [
      { requester: userId },
      { receiver: userId }
    ]
  };

  if (status) {
    query.status = status;
  }

  return this.find(query)
    .populate('requester', 'firstName lastName avatar email')
    .populate('receiver', 'firstName lastName avatar email')
    .sort({ createdAt: -1 });
};

// Static method to find active swaps
swapSchema.statics.findActiveSwaps = function(userId) {
  return this.find({
    $or: [
      { requester: userId },
      { receiver: userId }
    ],
    status: { $in: ['accepted', 'active'] }
  })
    .populate('requester receiver', 'firstName lastName avatar email')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Swap', swapSchema);
