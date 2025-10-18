// models/SwapRequest.js
const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  offering: {
    skillName: {
      type: String,
      required: true,
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
      required: true
    }
  },

  lookingFor: {
    skillName: {
      type: String,
      required: true,
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
      required: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  },
  relatedSwap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Swap',
    default: null
  },
  preferences: {
    format: {
      type: String,
      enum: ['online', 'offline', 'both'],
      default: 'online'
    },
    sessionDuration: {
      type: Number,
      default: 60
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'flexible'],
      default: 'weekly'
    }
  },

  status: {
    type: String,
    enum: ['open', 'closed', 'matched'],
    default: 'open'
  },

  responses: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date,
      default: Date.now
    }
  }]

}, {
  timestamps: true
});

swapRequestSchema.index({ 'offering.skillName': 1 });
swapRequestSchema.index({ 'lookingFor.skillName': 1 });
swapRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('SwapRequest', swapRequestSchema);
