import express from 'express';
import Plot from '../models/Plot.js';
import FamilyMember from '../models/FamilyMember.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all plots belonging to the user
// @route   GET /api/plots
// @access  Private
router.get('/', protect, async (req, res) => {
  const { ownerId, search } = req.query;

  try {
    // Build query using indexes directly
    let query = { userId: req.user._id };
    
    // Filter by specific family member if provided
    if (ownerId) {
      query.ownerId = ownerId;
    }

    // Server-side debounced search using indexes
    if (search) {
      const searchTrimmed = search.trim();
      query.$or = [
        { khataNo: searchTrimmed },
        { gataNo: searchTrimmed },
        { khasraNo: searchTrimmed }
      ];
    }

    const plots = await Plot.find(query)
      .populate('ownerId', 'name relation photo')
      .sort({ createdAt: -1 });

    res.json(plots);
  } catch (error) {
    console.error('Fetch plots error:', error);
    res.status(500).json({ message: 'Server error, failed to fetch plots' });
  }
});

// @desc    Add a plot
// @route   POST /api/plots
// @access  Private
router.post('/', protect, async (req, res) => {
  const { ownerId, khataNo, gataNo, khasraNo, village, tehsil, district, state } = req.body;

  if (!ownerId || !district || !tehsil) {
    return res.status(400).json({ message: 'Please specify owner, district and tehsil' });
  }

  // Validate at least one of Khata, Gata, or Khasra is filled
  const hasKhata = khataNo && khataNo.trim().length > 0;
  const hasGata = gataNo && gataNo.trim().length > 0;
  const hasKhasra = khasraNo && khasraNo.trim().length > 0;

  if (!hasKhata && !hasGata && !hasKhasra) {
    return res.status(400).json({ 
      message: 'Please enter at least one of Khata Number, Gata Number, or Khasra Number.',
      message_hi: 'Khata, Gata ya Khasra Number me se kam se kam ek bharna avashyak hai.'
    });
  }

  try {
    // Verify that the ownerId belongs to this user
    const owner = await FamilyMember.findOne({ _id: ownerId, userId: req.user._id });
    if (!owner) {
      return res.status(400).json({ message: 'Invalid owner specified or unauthorized' });
    }

    const plot = await Plot.create({
      userId: req.user._id,
      ownerId,
      ownerName: owner.name,
      khataNo: khataNo ? khataNo.trim() : '',
      gataNo: gataNo ? gataNo.trim() : '',
      khasraNo: khasraNo ? khasraNo.trim() : '',
      village: village ? village.trim() : '',
      tehsil: tehsil.trim(),
      district: district.trim(),
      state: state || 'Uttar Pradesh',
    });

    const populatedPlot = await Plot.findById(plot._id).populate('ownerId', 'name relation photo');
    res.status(201).json(populatedPlot);
  } catch (error) {
    console.error('Create plot error:', error);
    res.status(500).json({ message: 'Server error, failed to save plot' });
  }
});

// @desc    Update a plot
// @route   PUT /api/plots/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { ownerId, khataNo, gataNo, khasraNo, village, tehsil, district, state } = req.body;

  if (!ownerId || !district || !tehsil) {
    return res.status(400).json({ message: 'Please specify owner, district and tehsil' });
  }

  // Validate at least one of Khata, Gata, or Khasra is filled
  const hasKhata = khataNo && khataNo.trim().length > 0;
  const hasGata = gataNo && gataNo.trim().length > 0;
  const hasKhasra = khasraNo && khasraNo.trim().length > 0;

  if (!hasKhata && !hasGata && !hasKhasra) {
    return res.status(400).json({ 
      message: 'Please enter at least one of Khata Number, Gata Number, or Khasra Number.',
      message_hi: 'Khata, Gata ya Khasra Number me se kam se kam ek bharna avashyak hai.'
    });
  }

  try {
    let plot = await Plot.findById(req.params.id);

    if (!plot) {
      return res.status(404).json({ message: 'Plot not found' });
    }

    // Verify ownership of the plot
    if (plot.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this plot' });
    }

    // Verify ownerId belongs to this user
    const owner = await FamilyMember.findOne({ _id: ownerId, userId: req.user._id });
    if (!owner) {
      return res.status(400).json({ message: 'Invalid owner specified' });
    }

    plot.ownerId = ownerId;
    plot.ownerName = owner.name;
    plot.khataNo = khataNo ? khataNo.trim() : '';
    plot.gataNo = gataNo ? gataNo.trim() : '';
    plot.khasraNo = khasraNo ? khasraNo.trim() : '';
    plot.village = village ? village.trim() : '';
    plot.tehsil = tehsil.trim();
    plot.district = district.trim();
    plot.state = state || 'Uttar Pradesh';

    const updatedPlot = await plot.save();
    const populatedPlot = await Plot.findById(updatedPlot._id).populate('ownerId', 'name relation photo');

    res.json(populatedPlot);
  } catch (error) {
    console.error('Update plot error:', error);
    res.status(500).json({ message: 'Server error, failed to update plot' });
  }
});

// @desc    Delete a plot
// @route   DELETE /api/plots/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const plot = await Plot.findById(req.params.id);

    if (!plot) {
      return res.status(404).json({ message: 'Plot not found' });
    }

    // Verify ownership of the plot
    if (plot.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this plot' });
    }

    await Plot.deleteOne({ _id: plot._id });
    res.json({ message: 'Plot successfully deleted' });
  } catch (error) {
    console.error('Delete plot error:', error);
    res.status(500).json({ message: 'Server error, failed to delete plot' });
  }
});

export default router;
