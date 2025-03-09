const authService = require("~/services/authService");

class AuthController {
  async login(req, res) {
    const rawUserData = req.body;
    const result = await authService.loginUser(rawUserData);

    res.json(result);
  }

  async logout(req, res) {
    const result = await authService.logoutUser();
    res.json(result);
  }

  async register(req, res) {
    const rawUserData = req.body;
    const result = await authService.registerUser(rawUserData);

    res.json(result);
  }

  async changePassword(req, res) {
    const rawUserData = req.body;
    const result = await authService.changePassword(rawUserData);

    res.json(result);
  }

  async forgotPassword(req, res) {
    const rawUserData = req.body;
    console.log("rawUserData", rawUserData);
    const result = await authService.forgotPassword(rawUserData);

    res.json(result);
  }

  async resetPassword(req, res) {
    const rawUserData = req.body;
    const result = await authService.resetPassword(rawUserData);

    res.json(result);
  }
}

module.exports = new AuthController();
