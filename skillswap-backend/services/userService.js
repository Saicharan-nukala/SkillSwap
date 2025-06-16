const User = require('../models/User');

exports.getUserById = async (userId) => {
  const user = await User.findById(userId)
    .select('-password -emailOTP -otpExpires -__v');
  
  if (!user) {
    throw new Error('User not found');
    // Or create custom error: throw new NotFoundError('User not found');
  }

  return user;
};

exports.updateUser = async (userId, updates, authenticatedUserId) => {
  // Verify ownership
  if (userId !== authenticatedUserId.toString()) {
    throw new Error('Unauthorized to update this profile');
  }

  // Prevent sensitive field updates
  const { email, password, isEmailVerified, emailOTP, otpExpires, ...safeUpdates } = updates;

  const user = await User.findByIdAndUpdate(
    userId,
    safeUpdates,
    { new: true, runValidators: true }
  ).select('-password -emailOTP -otpExpires -__v');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};