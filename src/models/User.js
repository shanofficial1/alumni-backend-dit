import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  mobile: { type: String, required: true, trim: true, maxlength: 18 },
  program: { type: String, required: true, trim: true },
  batch: { type: String, required: true, trim: true },
  workingStatus: { type: String, required: true, enum: ['Employed', 'Self-employed', 'Entrepreneur', 'Higher Studies', 'Unemployed'] },
  company: { type: String, trim: true, maxlength: 120, default: '' },
  companyWebsite: { type: String, trim: true, maxlength: 250, default: '' },
  linkedinProfile: { type: String, trim: true, maxlength: 250, default: '' },
  role: { type: String, enum: ['alumni', 'admin'], default: 'alumni' }
}, { timestamps: true, versionKey: false });

userSchema.index({ program: 1, batch: 1, workingStatus: 1 });
export default mongoose.model('User', userSchema);
