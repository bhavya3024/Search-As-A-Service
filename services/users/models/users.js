const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: false
  },
  otpVerified: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: {
    type: String,
    default: false,
  },
  resetPasswordExpires: {
    type: Date,
    default: false
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;