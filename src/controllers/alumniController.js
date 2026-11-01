import { profileUpdateSchema } from '../utils/validation.js';
import User from '../models/User.js';

export async function getMyProfile(req, res) {
  res.json({ user: req.user });
}

export async function listAlumni(req, res, next) {
  try {
    const { search = '', program = '', batch = '', workingStatus = '' } = req.query;
    const filter = { role: 'alumni' };
    if (program) filter.program = program;
    if (batch) filter.batch = batch;
    if (workingStatus) filter.workingStatus = workingStatus;
    if (search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [{ fullName: new RegExp(escaped, 'i') }, { email: new RegExp(escaped, 'i') }, { mobile: new RegExp(escaped, 'i') }];
    }
    const alumni = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).lean();
    res.json({ alumni, total: alumni.length });
  } catch (error) { next(error); }
}


export async function updateMyProfile(req, res, next) {
  try {
    if (req.user.role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni members can edit this profile.' });
    }

    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Please correct the profile details.',
        errors: parsed.error.flatten()
      });
    }

    const data = parsed.data;
    const companyRequired = ['Employed', 'Self-employed', 'Entrepreneur', 'Higher Studies'].includes(data.workingStatus);

    const updated = await User.findOneAndUpdate(
      { _id: req.user._id, role: 'alumni' },
      {
        $set: {
          ...data,
          company: companyRequired ? data.company : '',
          companyWebsite: companyRequired ? (data.companyWebsite || '') : ''
        }
      },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updated) return res.status(404).json({ message: 'Alumni profile not found.' });

    return res.json({ message: 'Profile updated successfully.', user: updated });
  } catch (error) {
    next(error);
  }
}
