const { registerUser, loginUser } = require('./auth.service');

async function registerUserHandler(req, res) {
  try {
    const user = await registerUser(req.body);
    return res.status(201).json({
      message: 'User created successfully',
      user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({ 
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
    
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        message: 'A user with this email or blockchain identity already exists',
        timestamp: new Date().toISOString(),
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        message: 'Invalid organization ID provided',
        timestamp: new Date().toISOString(),
      });
    }
    
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function loginUserHandler(req, res) {
  try {
    const { token } = await loginUser(req.body);
    return res.status(200).json({
      message: 'Login successful',
      token,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message.includes('Invalid email or password')) {
      return res.status(401).json({ 
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
    
    if (error.message.includes('deactivated')) {
      return res.status(403).json({ 
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
    
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

async function getMeHandler(req, res) {
  try {
    // The user object is attached to req by the authMiddleware
    res.status(200).json({ 
      user: req.user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = {
  registerUserHandler,
  loginUserHandler,
  getMeHandler,
};