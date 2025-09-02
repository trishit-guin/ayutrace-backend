const { registerUser, loginUser } = require('./auth.service');

async function registerUserHandler(req, res) {
  try {
    const user = await registerUser(req.body);
    return res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function loginUserHandler(req, res) {
  try {
    const { token } = await loginUser(req.body);
    return res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
}

async function getMeHandler(req, res) {
  // The user object is attached to req by the authMiddleware
  res.status(200).json({ user: req.user });
}

module.exports = {
  registerUserHandler,
  loginUserHandler,
  getMeHandler,
};