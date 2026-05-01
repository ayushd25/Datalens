import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

function signRefreshToken(id) {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

function setTokenCookie(res, token, name, maxAge) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(name, token, {
    httpOnly: true,
    secure: isProduction,           // true on Render/HTTPS
    sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-domain cookies
    maxAge,
    path: '/'
  });
}

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }
    const user = await User.create({ name, email, password });
    const accessToken = signToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    setTokenCookie(res, accessToken, 'accessToken', 15 * 60 * 1000);
    setTokenCookie(res, refreshToken, 'refreshToken', 7 * 24 * 60 * 60 * 1000);
    res.status(201).json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, plan: user.plan }, accessToken } });
  } catch (error) { next(error); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    const accessToken = signToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    setTokenCookie(res, accessToken, 'accessToken', 15 * 60 * 1000);
    setTokenCookie(res, refreshToken, 'refreshToken', 7 * 24 * 60 * 60 * 1000);
    res.json({ success: true, data: { user: { id: user._id, name: user.name, email: user.email, plan: user.plan }, accessToken } });
  } catch (error) { next(error); }
}

export async function refreshToken(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, error: 'No refresh token provided.' });
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, error: 'User no longer exists.' });
    const accessToken = signToken(user._id);
    setTokenCookie(res, accessToken, 'accessToken', 15 * 60 * 1000);
    res.json({ success: true, data: { accessToken } });
  } catch (error) { next(error); }
}

export async function logout(req, res) {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully' });
}

export async function getMe(req, res) {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        plan: req.user.plan,
        apiKeyGemini: req.user.apiKeyGemini ? '***configured***' : '',
        apiKeyOpenRouter: req.user.apiKeyOpenRouter ? '***configured***' : ''
      }
    }
  });
}

export async function updateProfile(req, res, next) {
  try {
    const { name, email, apiKeyGemini, apiKeyOpenRouter, currentPassword, newPassword } = req.body;
    
    // 1. Fetch the actual Mongoose document (not a raw MongoDB update)
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // 2. Update simple fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (apiKeyGemini !== undefined) user.apiKeyGemini = apiKeyGemini;
    if (apiKeyOpenRouter !== undefined) user.apiKeyOpenRouter = apiKeyOpenRouter;

    // 3. Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, error: 'Current password is required to change password.' });
      }
      
      // Fetch password field temporarily for comparison (since schema has select: false)
      const userWithPass = await User.findById(req.user._id).select('+password');
      const isMatch = await userWithPass.comparePassword(currentPassword);
      
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Current password is incorrect.' });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ success: false, error: 'New password must be at least 8 characters.' });
      }
      
      // Assigning the plain text password here is SAFE because...
      user.password = newPassword; 
    }

    // 4. ...calling .save() triggers the pre('save') hook which HASHES it!
    await user.save(); 

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          apiKeyGemini: user.apiKeyGemini ? '***configured***' : '',
          apiKeyOpenRouter: user.apiKeyOpenRouter ? '***configured***' : ''
        }
      }
    });
  } catch (error) { 
    next(error); 
  }
}