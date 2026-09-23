import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Group from '../models/Group.js';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({ 
      name, 
      email, 
      passwordHash 
    });
    
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  res.status(200).json({ user: req.user });
};

export const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username || username.length < 3) {
      return res.status(400).json({ message: 'Invalid username' });
    }
    
    // Allow alphanumeric, underscore, dot, dash
    const isValid = /^[a-zA-Z0-9_.-]+$/.test(username);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid characters in username' });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    res.status(200).json({ available: !existingUser });
  } catch (error) {
    res.status(500).json({ message: 'Error checking username', error: error.message });
  }
};

export const checkUpiId = async (req, res) => {
  try {
    const { upiId } = req.query;
    if (!upiId) {
      return res.status(400).json({ message: 'UPI ID is required' });
    }
    
    const formattedUpi = upiId.trim();
    const existingUpi = await User.findOne({ upiId: formattedUpi });
    res.status(200).json({ available: !existingUpi });
  } catch (error) {
    res.status(500).json({ message: 'Error checking UPI ID', error: error.message });
  }
};

export const setUsername = async (req, res) => {
  try {
    const { username, upiId } = req.body;
    
    if (!username || username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }
    
    const isValid = /^[a-zA-Z0-9_.-]+$/.test(username);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid characters in username' });
    }

    // Check if user already has a username set
    const user = await User.findById(req.user._id);
    if (user.username) {
      return res.status(400).json({ message: 'Username is already set' });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'This username is already taken' });
    }

    user.username = username.toLowerCase();
    
    if (upiId && upiId.trim() !== '') {
      const formattedUpi = upiId.trim();
      const existingUpi = await User.findOne({ upiId: formattedUpi });
      if (existingUpi && existingUpi._id.toString() !== user._id.toString()) {
        return res.status(409).json({ message: 'This UPI ID is already registered to another user' });
      }
      user.upiId = formattedUpi;
    }
    
    await user.save();

    res.status(200).json({ message: 'Username set successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to set username', error: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Remove user from all groups they belong to
    await Group.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );

    // Delete user record from database
    await User.findByIdAndDelete(userId);

    // Clear authentication cookie
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: 'Account permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, username, upiId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) {
      user.name = name;
    }
    
    if (username !== undefined) {
      if (username.trim() !== '') {
        const formattedUsername = username.trim().toLowerCase();
        
        if (formattedUsername.length < 3) {
          return res.status(400).json({ message: 'Username must be at least 3 characters' });
        }
        
        const isValid = /^[a-zA-Z0-9_.-]+$/.test(formattedUsername);
        if (!isValid) {
          return res.status(400).json({ message: 'Invalid characters in username' });
        }
        
        const existingUsername = await User.findOne({ username: formattedUsername });
        if (existingUsername && existingUsername._id.toString() !== user._id.toString()) {
          return res.status(409).json({ message: 'This username is already taken' });
        }
        user.username = formattedUsername;
      }
    }

    if (upiId !== undefined) {
      if (upiId.trim() !== '') {
        const formattedUpi = upiId.trim();
        const existingUpi = await User.findOne({ upiId: formattedUpi });
        if (existingUpi && existingUpi._id.toString() !== user._id.toString()) {
          return res.status(409).json({ message: 'This UPI ID is already registered to another user' });
        }
        user.upiId = formattedUpi;
      } else {
        user.upiId = ''; // Allow setting to empty string to remove
      }
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        upiId: user.upiId,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};
