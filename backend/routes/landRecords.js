import express from 'express';
import Plot from '../models/Plot.js';
import FamilyMember from '../models/FamilyMember.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate official-looking mock land records based on plot details
const generateMockLandRecord = (plot, ownerName) => {
  // Use simple hash/char codes from village, khataNo, gataNo to make the details stable/reproducible
  const seed = (plot.khataNo || '') + (plot.gataNo || '') + (plot.village || '');
  let charSum = 0;
  for (let i = 0; i < seed.length; i++) {
    charSum += seed.charCodeAt(i);
  }

  const bhulekhCode = `UP${1000000 + (charSum % 899999)}`;
  const area = ((charSum % 150) / 100 + 0.15).toFixed(4); // e.g. 0.1500 to 1.6500 hectares
  const revenue = ((charSum % 50) + 15.50).toFixed(2); // e.g. Rs 15.50 to 65.50
  
  // Predictable shareholders list
  const shareholders = [
    { name: ownerName, relation: 'Self/Primary', share: '1/2' },
    { name: `Rajesh Kumar s/o Late ${ownerName.split(' ')[0]}`, relation: 'Brother', share: '1/4' },
    { name: `Suresh Kumar s/o Late ${ownerName.split(' ')[0]}`, relation: 'Brother', share: '1/4' }
  ];

  // Bank loan details (mortgage) based on seed
  const hasMortgage = charSum % 3 === 0;
  const remarks = hasMortgage 
    ? `Mortgaged to State Bank of India, ${plot.tehsil} Branch for KCC Crop Loan of Rs 1,20,000/- dated 12/04/2025.`
    : 'No active liabilities. Clean title record.';

  return {
    bhulekhCode,
    fasliYear: '1431-1436 (2024-2029)',
    landType: charSum % 5 === 0 ? 'Residential/Abadi' : 'Agricultural - Irrigated (Double Crop)',
    areaHectares: area,
    lagaanRevenueRs: revenue,
    shareholders,
    remarks,
    verifiedAt: new Date().toISOString(),
    documentId: `KHT-${bhulekhCode}-${plot.khataNo}-${plot.gataNo}`,
  };
};

// @desc    Get latest land record (Khatauni) for a plot
// @route   GET /api/land-records/:plotId
// @access  Private
router.get('/:plotId', protect, async (req, res) => {
  try {
    const plot = await Plot.findById(req.params.plotId).populate('ownerId');

    if (!plot) {
      return res.status(404).json({ message: 'Plot not found' });
    }

    // Verify ownership
    const owner = await FamilyMember.findOne({ _id: plot.ownerId, userId: req.user._id });
    if (!owner) {
      return res.status(401).json({ message: 'Unauthorized access to this plot\'s records' });
    }

    const apiUrl = process.env.LAND_RECORD_API_URL;

    // If external api is configured, attempt to fetch from it
    if (apiUrl) {
      try {
        const fetchUrl = `${apiUrl}?khataNo=${plot.khataNo}&gataNo=${plot.gataNo}&village=${encodeURIComponent(plot.village)}&tehsil=${encodeURIComponent(plot.tehsil)}&district=${encodeURIComponent(plot.district)}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 sec timeout for low-end / slow network robustness
        
        const response = await fetch(fetchUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          return res.json({
            plot,
            record: data,
            source: 'official_api'
          });
        }
      } catch (fetchErr) {
        console.warn('Official land record API call failed, falling back to mock generator:', fetchErr.message);
      }
    }

    // Fallback or default mock data generation
    const mockRecord = generateMockLandRecord(plot, owner.name);
    
    // Simulate slow network (optional delay) for displaying skeleton screen & spinners beautifully in frontend
    // We will delay by 1 second to make the loading UI noticeable to farmer
    await new Promise(resolve => setTimeout(resolve, 800));

    res.json({
      plot,
      record: mockRecord,
      source: 'simulated_fallback'
    });

  } catch (error) {
    console.error('Fetch land record error:', error);
    res.status(500).json({ message: 'Server error, failed to retrieve land record' });
  }
});

export default router;
