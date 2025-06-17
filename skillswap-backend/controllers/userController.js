const userService = require('../services/userService');

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUser(
      req.params.id,
      req.body,
      req.user.id // Pass authenticated user ID for ownership check
    );
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};
