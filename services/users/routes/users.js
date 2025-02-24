const router = require('express').Router();
const userController = require('../controllers/user');
const validator = require('express-joi-validation').createValidator({});
const { createUser, updateUser } = require('../validations/user');

router.post('/sign-up', validator.body(createUser), userController.signUp);
router.post('/verify-otp', userController.verifyOtp);
router.post('/sign-in', userController.login);
router.post('/send-reset-password-email', userController.sendResetPasswordEmail);
router.post('/reset-password', userController.resetPassword);
router.get('/profile', userController.getProfile);
router.get('/reset-password-html', userController.getResetPasswordHtml);
router.put('/update-user', validator.body(updateUser), userController.updateUser);

module.exports = router;




