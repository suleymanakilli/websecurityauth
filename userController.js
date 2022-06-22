const User = require('./usermodel');
const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/appError');




exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  // Tour.findOne({ _id: req.params.id })

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});


exports.getAllUser = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});
