const userService = require('../services/user-service');

const signUp = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const verified = await userService.verifyOtp(userId, otp);
    res.status(verified ? 200 : 400).json({ verified });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userService.loginUser(email, password);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const sendResetPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;
    await userService.sendResetPasswordEmail(email);
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await userService.resetPassword(token, newPassword);
    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getResetPasswordHtml = (req, res) => {
  const htmlContent = `
    <html>
      <body>
        <form action="/api/users/reset-password" method="POST">
          <input type="hidden" name="token" value="${req.query.token}" />
          <label for="newPassword">New Password:</label>
          <input type="password" id="newPassword" name="newPassword" required />
          <button type="submit">Reset Password</button>
        </form>
      </body>
    </html>
  `;
  res.send(htmlContent);
};

const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.user.id, req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  signUp,
  verifyOtp,
  login,
  sendResetPasswordEmail,
  resetPassword,
  getProfile,
  getResetPasswordHtml,
  updateUser
};