// controllers/swapController.js - FULLY CORRECTED

const Swap = require('../models/Swap');
const User = require('../models/User');

// Create new swap request
exports.createSwapRequest = async (req, res) => {
  try {
    const {
      receiverId,
      requesterOffering,
      receiverOffering,
      preferences
    } = req.body;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Prevent self-swap
    if (req.user._id.toString() === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create swap with yourself'
      });
    }

    // Check for existing pending swap
    const existingSwap = await Swap.findOne({
      $or: [
        { requester: req.user._id, receiver: receiverId, status: 'pending' },
        { requester: receiverId, receiver: req.user._id, status: 'pending' }
      ]
    });

    if (existingSwap) {
      return res.status(400).json({
        success: false,
        message: 'Pending swap request already exists'
      });
    }

    const swap = await Swap.create({
      requester: req.user._id,
      receiver: receiverId,
      skillExchange: {
        requesterOffering,
        receiverOffering
      },
      preferences
    });

    await swap.populate('requester receiver', 'firstName lastName avatar email');

    res.status(201).json({
      success: true,
      message: 'Swap request created successfully',
      data: swap
    });

  } catch (error) {
    console.error('Create Swap Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating swap request',
      error: error.message
    });
  }
}; 
// Get all swaps for current user
// In swapController.js
exports.getUserSwaps = async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build query
    let query = {
      $or: [
        { requester: req.user._id },
        { receiver: req.user._id }
      ]
    };
    
    if (status) {
      query.status = status;
    }
    
    const swaps = await Swap.find(query)
      .populate('requester receiver', 'firstName lastName avatar email')
      .populate('sessions')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: swaps.length,
      data: swaps
    });
  } catch (error) {
    console.error('Get Swaps Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching swaps',
      error: error.message
    });
  }
};

// controllers/swapController.js - UPDATE THIS FUNCTION

exports.getSwapById = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)
      .populate('requester receiver', 'firstName lastName avatar email location availability')
      .populate({
        path: 'sessions',
        options: { sort: { scheduledDate: 1 } }
      })
      .populate('messages.sender', 'firstName lastName avatar');

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // ✅ FIX: Check if user is participant BEFORE calling isParticipant
    const userId = req.user._id.toString();
    const requesterId = swap.requester._id ? swap.requester._id.toString() : swap.requester.toString();
    const receiverId = swap.receiver._id ? swap.receiver._id.toString() : swap.receiver.toString();
    
    const isParticipant = requesterId === userId || receiverId === userId;
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this swap'
      });
    }

    res.status(200).json({
      success: true,
      data: swap
    });

  } catch (error) {
    console.error('Get Swap Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching swap',
      error: error.message
    });
  }
};

// Accept swap request
exports.acceptSwapRequest = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // Only receiver can accept
    if (swap.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only receiver can accept the swap request'
      });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Swap is not in pending status'
      });
    }

    swap.status = 'accepted';
    await swap.save();

    // ✅ FIX 1: Delete ALL other pending swaps involving BOTH users
    await Swap.deleteMany({
      _id: { $ne: swap._id }, // Exclude current swap
      status: 'pending',
      $or: [
        { requester: swap.requester },
        { requester: swap.receiver },
        { receiver: swap.requester },
        { receiver: swap.receiver }
      ]
    });

    // ✅ FIX 2: Mark ALL swap requests from both users as inactive
    const SwapRequest = require('../models/SwapRequest');
    await SwapRequest.updateMany(
      {
        $or: [
          { user: swap.requester },
          { user: swap.receiver }
        ],
        status: { $nin: ['inactive', 'matched'] }
      },
      {
        $set: {
          status: 'inactive',
          relatedSwap: swap._id
        }
      }
    );

    await swap.populate('requester receiver', 'firstName lastName avatar email');

    res.status(200).json({
      success: true,
      message: 'Swap request accepted',
      data: swap
    });

  } catch (error) {
    console.error('Accept Swap Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting swap',
      error: error.message
    });
  }
};

 
// Reject swap request
exports.rejectSwapRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // Only receiver can reject
    if (swap.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only receiver can reject the swap request'
      });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Swap is not in pending status'
      });
    }

    swap.status = 'rejected';
    swap.cancellationReason = reason;
    await swap.save();

    res.status(200).json({
      success: true,
      message: 'Swap request rejected',
      data: swap
    });

  } catch (error) {
    console.error('Reject Swap Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting swap',
      error: error.message
    });
  }
}; 
// Cancel swap
exports.cancelSwap = async (req, res) => {
  try {
    const { reason } = req.body;
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // Check if user is participant
    if (!swap.isParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this swap'
      });
    }

    if (swap.status === 'completed' || swap.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed or already cancelled swap'
      });
    }

    swap.status = 'cancelled';
    swap.cancellationReason = reason;
    await swap.save();

    res.status(200).json({
      success: true,
      message: 'Swap cancelled successfully',
      data: swap
    });

  } catch (error) {
    console.error('Cancel Swap Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling swap',
      error: error.message
    });
  }
}; 
// Complete swap
exports.completeSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // Check if user is participant
    if (!swap.isParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (swap.status !== 'active' && swap.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Only active swaps can be completed'
      });
    }

    swap.status = 'completed';
    await swap.save();

    res.status(200).json({
      success: true,
      message: 'Swap completed successfully',
      data: swap
    });

  } catch (error) {
    console.error('Complete Swap Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing swap',
      error: error.message
    });
  }
}; 
// Add message to swap
// Add message to swap
exports.addMessageToSwap = async (req, res) => {
  try {
    const { content } = req.body;
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // Check if user is participant
    if (!swap.isParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await swap.addMessage(req.user._id, content);
    await swap.populate('messages.sender', 'firstName lastName avatar');
    await swap.populate('requester receiver', 'firstName lastName avatar email');

    const newMessage = swap.messages[swap.messages.length - 1];
    
    // Get io instance
    const io = req.app.get('io');
    
    // ✅ FIX 1: Emit to the swap room (for real-time messages in chat)
    io.to(req.params.id).emit('newMessage', {
      ...newMessage.toObject(),
      swapId: req.params.id,
      swap: req.params.id
    });
    
    // ✅ FIX 2: Emit to BOTH participants for swap list updates
    const requesterId = swap.requester._id.toString();
    const receiverId = swap.receiver._id.toString();
    
    // Emit swap list update event with full swap data
    const swapUpdateData = {
      swapId: req.params.id,
      lastMessage: newMessage,
      lastMessageTime: newMessage.createdAt,
      requester: requesterId,
      receiver: receiverId,
      otherUser: swap.requester._id.toString() === req.user._id.toString() 
        ? { _id: receiverId, firstName: swap.receiver.firstName, lastName: swap.receiver.lastName, avatar: swap.receiver.avatar }
        : { _id: requesterId, firstName: swap.requester.firstName, lastName: swap.requester.lastName, avatar: swap.requester.avatar }
    };
    
    // Emit to both users' personal channels
    io.emit('swapListUpdate', swapUpdateData);

    res.status(200).json({
      success: true,
      message: 'Message added successfully',
      data: swap.messages
    });
  } catch (error) {
    console.error('Add Message Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding message',
      error: error.message
    });
  }
};


// Add review to swap
exports.addReviewToSwap = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    if (swap.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed swaps'
      });
    }

    // Check if user is requester or receiver
    const isRequester = swap.requester.toString() === req.user._id.toString();
    const isReceiver = swap.receiver.toString() === req.user._id.toString();

    if (!isRequester && !isReceiver) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (isRequester) {
      swap.reviews.requesterReview = {
        rating,
        comment,
        reviewedAt: new Date()
      };
    } else {
      swap.reviews.receiverReview = {
        rating,
        comment,
        reviewedAt: new Date()
      };
    }

    await swap.save();

    // Update user ratings
    const otherUser = isRequester ? swap.receiver : swap.requester;
    const user = await User.findById(otherUser);
    
    if (user && user.ratings && user.ratings.teaching) {
      const currentRating = user.ratings.teaching.average || 0;
      const currentCount = user.ratings.teaching.count || 0;
      const newAverage = ((currentRating * currentCount) + rating) / (currentCount + 1);
      
      user.ratings.teaching.average = newAverage;
      user.ratings.teaching.count = currentCount + 1;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Review added successfully',
      data: swap
    });

  } catch (error) {
    console.error('Add Review Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding review',
      error: error.message
    });
  }
}; 
// Get swap statistics for user
exports.getSwapStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Swap.aggregate([
      {
        $match: {
          $or: [
            { requester: userId },
            { receiver: userId }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalSwaps = await Swap.countDocuments({
      $or: [
        { requester: userId },
        { receiver: userId }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalSwaps,
        byStatus: stats
      }
    });

  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
}; 
exports.setupSwap = async (req, res) => {
  try {
    const { totalSessions } = req.body;
    
    if (!totalSessions || totalSessions < 1) {
      return res.status(400).json({
        success: false,
        message: 'Total sessions must be at least 1'
      });
    }

    const swap = await Swap.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }

    // Check if user is participant
    const userId = req.user._id.toString();
    const requesterId = swap.requester._id ? swap.requester._id.toString() : swap.requester.toString();
    const receiverId = swap.receiver._id ? swap.receiver._id.toString() : swap.receiver.toString();
    
    if (requesterId !== userId && receiverId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // ✅ UPDATE: Set total sessions for the correct teacher
    if (requesterId === userId) {
      // Requester is setting their teaching sessions
      swap.skillExchange.requesterOffering.totalSessions = totalSessions;
    } else {
      // Receiver is setting their teaching sessions
      swap.skillExchange.receiverOffering.totalSessions = totalSessions;
    }

    await swap.save();

    // Populate and return
    await swap.populate('requester receiver', 'firstName lastName avatar email');
    await swap.populate('sessions');

    res.status(200).json({
      success: true,
      message: 'Total sessions updated successfully',
      data: swap
    });
  } catch (error) {
    console.error('Setup Swap Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    
    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap not found'
      });
    }
    
    if (!swap.isParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    await swap.markMessagesAsRead(req.user._id);
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(req.params.id).emit('messagesRead', { 
      swapId: req.params.id, 
      userId: req.user._id 
    });
    
    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark Messages Read Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
      error: error.message
    });
  }
};
