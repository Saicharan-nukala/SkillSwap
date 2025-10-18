// controllers/swapRequestController.js

const SwapRequest = require('../models/SwapRequest');

exports.createRequest = async (req, res) => {
  try {
    const request = await SwapRequest.create({
      user: req.user._id,
      ...req.body
    });
    
    await request.populate('user', 'firstName lastName avatar location');
    
    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 
exports.getAllRequests = async (req, res) => {
  try {
    //  UPDATED: Check for 'active' status (when you add it to model)
    // For now, filter by 'open' and exclude your own requests
    const requests = await SwapRequest.find({
      status: 'open',  // Change to 'active' after updating model
      user: { $ne: req.user._id }
    })
    .populate('user', 'firstName lastName avatar location')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// controllers/swapRequestController.js

// controllers/swapRequestController.js - FIXED
exports.respondToRequest = async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // ✅ FIX: Check if request is already inactive or matched
    if (request.status === 'inactive' || request.status === 'matched') {
      return res.status(400).json({
        success: false,
        message: 'This request is no longer available'
      });
    }

    // Don't respond to your own request
    if (request.user.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot respond to your own request'
      });
    }

    // Import Swap model
    const Swap = require('../models/Swap');

    // ✅ FIX: Check if user already has a pending swap with this person
    const existingSwap = await Swap.findOne({
      $or: [
        { requester: req.user._id, receiver: request.user, status: 'pending' },
        { requester: request.user, receiver: req.user._id, status: 'pending' }
      ]
    });

    if (existingSwap) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request with this user'
      });
    }

    // Create a new swap
    const newSwap = await Swap.create({
      requester: req.user._id,
      receiver: request.user,
      skillExchange: {
        requesterOffering: {
          skillName: request.lookingFor.skillName,
          description: request.lookingFor.description,
          experienceLevel: request.lookingFor.experienceLevel,
          category: request.lookingFor.category || ''
        },
        receiverOffering: {
          skillName: request.offering.skillName,
          description: request.offering.description,
          experienceLevel: request.offering.experienceLevel,
          category: request.offering.category || ''
        }
      },
      status: 'pending',
      preferences: request.preferences
    });

    await newSwap.populate('requester receiver', 'firstName lastName email avatar');

    res.status(200).json({
      success: true,
      message: 'Response sent successfully',
      data: newSwap
    });

  } catch (error) {
    console.error('Error responding to request:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to request',
      error: error.message
    });
  }
};


// Get user's own requests
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await SwapRequest.find({ user: req.user._id })
      .populate('user', 'firstName lastName avatar location')
      .populate('responses.user', 'firstName lastName avatar email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Accept response
exports.acceptResponse = async (req, res) => {
  try {
    const { responderId } = req.body;
    const request = await SwapRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }
    
    if (request.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    const Swap = require('../models/Swap');
    const swap = await Swap.create({
      requester: req.user._id,
      receiver: responderId,
      skillExchange: {
        requesterOffering: request.offering,
        receiverOffering: request.lookingFor
      },
      preferences: request.preferences,
      status: 'accepted'
    });
    
    request.status = 'matched';
    await request.save();
    
    res.status(200).json({
      success: true,
      message: 'Swap created successfully',
      data: swap
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};