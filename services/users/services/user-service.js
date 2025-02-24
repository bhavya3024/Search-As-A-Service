const User = require('../models/users');
const otpService = require('./otp-service');
const sendEmail = require('../services/resend-service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createUser = async (userData) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    return { success: false, code: 400,  message: 'Email already exists' };
  }

  const user = new User(userData);
  user.password = await bcrypt.hash(user.password, 10);
  
  // Generate OTP
  user.otp = otpService.createOtp();
  
  await user.save();

  // Send OTP email
  const otpEmailContent = `<p>Your OTP for verification is: ${user.otp}</p>`;
  await sendEmail(process.env.RESEND_EMAIL, 'Your App', user.email, user.fullName, 'OTP Verification', otpEmailContent);

  return { success: true, result: user };
};

const verifyOtp = async (userId, otp) => {
  const user = await User.findById(userId);
  if (user.otp === otp) {
    user.otpVerified = true;
    await user.save();
    return { success: true, result: 'OTP verified' };
  }
  return { success: false, code: 401, message: 'Invalid OTP' };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { success: true, result: { user, token } };
  }
  return { success: false, code: 401,  message: 'Invalid email or password' };
};

const sendResetPasswordEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return { success: false, message: 'User not found' };

  const token = otpService.createOtp();
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  const resetUrl = `http://localhost:3001/api/v1/users/reset-password-html?token=${token}`;
  await sendEmail(process.env.RESEND_EMAIL, 'Your App', user.email, user.fullName, 'Password Reset', `<p>Click <a href="${resetUrl}">here</a> to reset your password</p>`);
  return { success: true, message: 'Email sent' };
};

const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
  if (!user) return { success: false, code: 400, message: 'Password reset token is invalid or has expired' };

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  return {  success: true, message: 'Password has been reset' };
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password').select('-otp').select('-otpVerified').select('-resetPasswordToken').select('-resetPasswordExpires');
  if (!user) return { success: false, code: 404, message: 'User not found' };
  return {  success: true, result: user };
};

const updateUser = async (userId, updateData) => {
  // Check if email already exists
  if (updateData.email) {
    const existingUser = await User.findOne({ email: updateData.email });
    if (existingUser && existingUser._id.toString() !== userId) {
      return { success: false, code: 400, message: 'Email already exists' };
    }
  }

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
  return { success: true, result: user };
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