import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import FamilyMember from '../models/FamilyMember.js';
import { protect } from '../middleware/auth.js';
import { upload, uploadToCloudinary } from '../config/cloudinary.js';

const router = express.Router();

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key_123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new farmer user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, mobile, password } = req.body;

  if (!name || !mobile || !password) {
    return res.status(400).json({ message: 'Please provide name, mobile, and password' });
  }

  try {
    // Check if user exists
    const userExists = await User.findOne({ mobile });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this mobile number' });
    }

    // Create user
    const user = await User.create({
      name,
      mobile,
      password,
    });

    // Automatically create primary profile in Family Members using the farmer's real name (never "Self")
    await FamilyMember.create({
      userId: user._id,
      name: user.name,
      relation: 'Self', // Internal relation tag, but UI displays the real name
      photo: '',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      profilePhoto: user.profilePhoto,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error, registration failed' });
  }
});

// @desc    Login farmer
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return res.status(400).json({ message: 'Please provide mobile number and password' });
  }

  try {
    const user = await User.findOne({ mobile });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        mobile: user.mobile,
        profilePhoto: user.profilePhoto,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid mobile number or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error, login failed' });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// @desc    Update farmer profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, upload.single('profilePhoto'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const originalName = user.name;

    // Update basic details
    if (req.body.name) user.name = req.body.name;
    if (req.body.mobile) {
      // Check if mobile number is taken by another user
      if (req.body.mobile !== user.mobile) {
        const mobileExists = await User.findOne({ mobile: req.body.mobile });
        if (mobileExists) {
          return res.status(400).json({ message: 'Mobile number is already registered by another user' });
        }
        user.mobile = req.body.mobile;
      }
    }

    // Change Password if requested
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Update Profile Photo if uploaded
    if (req.file) {
      user.profilePhoto = uploadToCloudinary(req, req.file);
    }

    const updatedUser = await user.save();

    // Sync primary family member's name if the user's name has changed
    if (req.body.name && req.body.name !== originalName) {
      await FamilyMember.findOneAndUpdate(
        { userId: user._id, relation: 'Self' },
        { name: req.body.name }
      );
    }

    // Also sync the photo to the primary family member profile if uploaded
    if (req.file) {
      await FamilyMember.findOneAndUpdate(
        { userId: user._id, relation: 'Self' },
        { photo: updatedUser.profilePhoto }
      );
    }

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      mobile: updatedUser.mobile,
      profilePhoto: updatedUser.profilePhoto,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error, update failed' });
  }
});

// @desc    Logout farmer
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
  res.json({ message: 'Successfully logged out' });
});

export default router;
