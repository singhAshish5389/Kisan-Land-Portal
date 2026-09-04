import mongoose from 'mongoose';

const plotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
    required: true,
    index: true,
  },
  ownerName: {
    type: String,
    required: [true, 'Owner Name is required'],
    trim: true,
  },
  khataNo: {
    type: String,
    default: '',
    trim: true,
    index: true,
  },
  gataNo: {
    type: String,
    default: '',
    trim: true,
    index: true,
  },
  khasraNo: {
    type: String,
    default: '',
    trim: true,
    index: true,
  },
  village: {
    type: String,
    default: '',
    trim: true,
  },
  tehsil: {
    type: String,
    required: [true, 'Tehsil is required'],
    trim: true,
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true,
  },
  state: {
    type: String,
    default: 'Uttar Pradesh',
    trim: true,
  },
}, {
  timestamps: true,
});

// Fast search indexes
plotSchema.index({ userId: 1, gataNo: 1 });
plotSchema.index({ userId: 1, khataNo: 1 });
plotSchema.index({ userId: 1, khasraNo: 1 });


const Plot = mongoose.model('Plot', plotSchema);
export default Plot;
