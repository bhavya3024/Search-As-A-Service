const User = require('../models/users');
const sendEmail = require('./resend-service');
const otpService = require('./otp-service');
const bcrypt = require('bcrypt');

const createUser = async (userData) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('Email already exists');
  }

  const user = new User(userData);
  user.password = await bcrypt.hash(user.password, 10);
  
  // Generate OTP
  user.otp = otpService.createOtp();
  
  await user.save();

  // Send OTP email
  const otpEmailContent = `<p>Your OTP for verification is: ${user.otp}</p>`;
  await sendEmail('no-reply@yourapp.com', 'Your App', user.email, user.fullName, 'OTP Verification', otpEmailContent);

  return user;
};

const verifyOtp = async (userId, otp) => {
  const user = await User.findById(userId);
  if (user.otp === otp) {
    user.otpVerified = true;
    await user.save();
    return true;
  }
  return false;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    return user;
  }
  throw new Error('Invalid email or password');
};

const sendResetPasswordEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  const token = otpService.createOtp();
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  const resetUrl = `http://localhost:${process.env.PORT || 3001}/reset-password/${token}`;
  await sendEmail('no-reply@yourapp.com', 'Your App', user.email, user.fullName, 'Password Reset', '', `<p>Click <a href="${resetUrl}">here</a> to reset your password</p>`);
};

const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
  if (!user) throw new Error('Password reset token is invalid or has expired');

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  return user;
};

const updateUser = async (userId, updateData) => {
  // Check if email already exists
  if (updateData.email) {
    const existingUser = await User.findOne({ email: updateData.email });
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new Error('Email already exists');
    }
  }

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
  return user;
};

module.exports = {
  createUser,
  verifyOtp,
  loginUser,
  sendResetPasswordEmail,
  resetPassword,
  getUserProfile,
  updateUser
};