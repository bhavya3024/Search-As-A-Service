const userService = require('../services/user-service');

const signUp = async (req, res) => {
  try {
    const { success, result, code, message } = await userService.createUser(req.body);
    if (!success) return res.status(code).json({ message });
    return res.status(201).json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const { success, result, message, code } = await userService.verifyOtp(userId, otp);
    if (!success) return res.status(code).json({ message });
    return res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { success, message, result } = await userService.loginUser(email, password);
    if (success) {
      return res.status(200).json({ result });
    } else {
      return res.status(401).json({ message });
    } 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sendResetPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const { success, message, code } = await userService.sendResetPasswordEmail(email);
    if (!success) return res.status(code).json({ message });
    return res.status(success ? 200 : code).json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const { success, message, code } =  await userService.resetPassword(token, newPassword);
    if (!success) return res.status(code).json({ message });
    return res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const { success, result, code, message } = await userService.getUserProfile(req.user.id);
    if (!success) return res.status(code).json({ message });
    return res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getResetPasswordHtml = (req, res) => {
  const htmlContent = `
    <html>
      <body>
        <form action="/api/v1/users/reset-password" method="POST">
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
    await userService.updateUser(req.user.id, req.body);
    return res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
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