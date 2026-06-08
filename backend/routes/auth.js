import express from 'express';

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Basic mock authentication
  if (email && password) {
    res.json({ 
      success: true, 
      token: 'mock-jwt-token-123',
      user: { id: 'user_1', email, name: 'Demo Worker' }
    });
  } else {
    res.status(400).json({ success: false, message: 'Email and password required' });
  }
});

export default router;
