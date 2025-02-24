const otpGenerator = require('otp-generator')


exports.createOtp = () => otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });