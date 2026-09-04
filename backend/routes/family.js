import express from 'express';
import FamilyMember from '../models/FamilyMember.js';
import Plot from '../models/Plot.js';
import { protect } from '../middleware/auth.js';
import { upload, uploadToCloudinary } from '../config/cloudinary.js';

const router = express.Router();

// @desc    Get all family members
// @route   GET /api/family
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const members = await FamilyMember.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.json(members);
  } catch (error) {
    console.error('Fetch family members error:', error);
    res.status(500).json({ message: 'Server error, failed to fetch family members' });
  }
});

// @desc    Add a family member
// @route   POST /api/family
// @access  Private
router.post('/', protect, upload.single('photo'), async (req, res) => {
  const { name, relation } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
    let photoUrl = '';
    if (req.file) {
      photoUrl = uploadToCloudinary(req, req.file);
    }

    const member = await FamilyMember.create({
      userId: req.user._id,
      name,
      relation: relation || '',
      photo: photoUrl,
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Create family member error:', error);
    res.status(500).json({ message: 'Server error, failed to add family member' });
  }
});

// @desc    Delete a family member
// @route   DELETE /api/family/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const member = await FamilyMember.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Family member not found' });
    }

    // Verify ownership
    if (member.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this family member' });
    }

    // Check if it is the primary profile
    if (member.relation === 'Self') {
      return res.status(400).json({ message: 'You cannot delete your own primary profile' });
    }

    // Delete associated plots for this family member
    await Plot.deleteMany({ ownerId: member._id });

    // Delete the family member record
    await FamilyMember.deleteOne({ _id: member._id });

    res.json({ message: 'Family member and associated land records successfully deleted' });
  } catch (error) {
    console.error('Delete family member error:', error);
    res.status(500).json({ message: 'Server error, failed to delete family member' });
  }
});

export default router;
