import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  relation: {
    type: String,
    default: '',
    trim: true,
  },
  photo: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Compound index to quick query family members by user
familyMemberSchema.index({ userId: 1, name: 1 });

const FamilyMember = mongoose.model('FamilyMember', familyMemberSchema);
export default FamilyMember;
