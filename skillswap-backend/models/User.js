// models/User.js - Updated User Model with Email Verification
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  intrest:{
    type: String,
    default:''
  },
  // Email Verification Fields - NEW
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailOTP: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },

  // Profile About Section
  about: {
    intro: {
      type: String,
      maxlength: [1000, 'Intro cannot exceed 1000 characters'],
      default: ''
    },
    experience: {
      type: String,
      maxlength: [2000, 'Experience description cannot exceed 2000 characters'],
      default: ''
    },
    quote: {
      type: String,
      maxlength: [200, 'Quote cannot exceed 200 characters'],
      default: ''
    }
  },

  // Skills Section - Technical and Teaching Skills
  skills: [{
    category: {
      type: String,
      required: [true, 'Skill category is required'],
      trim: true
    },
    skills: [{
      type: String,
      required: [true, 'Skill name is required'],
      trim: true
    }],
    colorScheme: {
      type: String,
      enum: ['blue', 'green', 'purple', 'orange', 'red', 'yellow', 'pink', 'indigo', 'teal', 'cyan'],
      default: 'blue'
    }
  }],

  // Work Experience
  experience: [{
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters']
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    period: {
      type: String,
      required: [true, 'Work period is required'],
      trim: true
    },
    description: {
      type: String,
      maxlength: [1000, 'Job description cannot exceed 1000 characters']
    },
    current: {
      type: Boolean,
      default: false
    }
  }],

  // Projects Portfolio
  projects: [{
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters']
    },
    tech: {
      type: String,
      required: [true, 'Technologies used is required'],
      trim: true,
      maxlength: [200, 'Technologies cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [1000, 'Project description cannot exceed 1000 characters']
    },
    url: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Please enter a valid URL'
      }
    },
    github: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Please enter a valid GitHub URL'
      }
    },
    image: String,
    featured: {
      type: Boolean,
      default: false
    }
  }],

  // Location and Availability
  location: {
    city: String,
    country: String,
    timezone: String
  },
  availability: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    timeSlots: [String],
    preferredFormat: {
      type: String,
      enum: ['online', 'offline', 'both'],
      default: 'both'
    }
  },

  // Social Links
  socialLinks: {
    linkedin: String,
    github: String,
    portfolio: String,
    twitter: String,
    instagram: String
  },

  // Ratings and Reviews
  ratings: {
    teaching: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 }
    },
    learning: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 }
    }
  },

  // Profile Settings
  settings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'members-only'],
      default: 'public'
    },
    emailNotifications: {
      matches: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      sessions: { type: Boolean, default: true },
      reviews: { type: Boolean, default: true }
    },
    profileComplete: {
      type: Boolean,
      default: false
    }
  },

  // Activity Tracking
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  profileViews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Calculate profile completion percentage
userSchema.methods.getProfileCompletionPercentage = function() {
  let completedFields = 0;
  const totalFields = 10;

  if (this.about.intro) completedFields++;
  if (this.about.experience) completedFields++;
  if (this.skills.length > 0) completedFields++;
  if (this.experience.length > 0) completedFields++;
  if (this.projects.length > 0) completedFields++;
  if (this.skillsToTeach && this.skillsToTeach.length > 0) completedFields++;
  if (this.skillsToLearn && this.skillsToLearn.length > 0) completedFields++;
  if (this.location.city && this.location.country) completedFields++;
  if (this.availability.days.length > 0) completedFields++;
  if (this.avatar) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
};

// Update profile completion status
userSchema.pre('save', function(next) {
  this.settings.profileComplete = this.getProfileCompletionPercentage() >= 70;
  next();
});

module.exports = mongoose.model('User', userSchema);