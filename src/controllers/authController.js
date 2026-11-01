import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { loginSchema, registerSchema } from '../utils/validation.js';

function makeToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
}
function publicUser(user) {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.passwordHash;
  return obj;
}

export async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Please correct the registration details.', errors: parsed.error.flatten() });
    const data = parsed.data;
    const exists = await User.findOne({ email: data.email });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });
    const passwordHash = await bcrypt.hash(data.password, 12);
    const companyRequired = ['Employed', 'Self-employed', 'Entrepreneur', 'Higher Studies'].includes(data.workingStatus);
    const user = await User.create({ ...data, company: companyRequired ? data.company : '', companyWebsite: companyRequired ? (data.companyWebsite || '') : '', passwordHash, role: 'alumni' });
    return res.status(201).json({ message: 'Registration successful. You can now sign in.', user: publicUser(user) });
  } catch (error) { next(error); }
}

async function signIn(req, res, next, requiredRole) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: 'Enter a valid email and password.' });
    const email = parsed.data.email.toLowerCase().trim();
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password.' });
    if (requiredRole && user.role !== requiredRole) return res.status(403).json({ message: 'This account does not have administrator access.' });
    if (!requiredRole && user.role !== 'alumni') return res.status(403).json({ message: 'Please use the administrator login.' });
    return res.json({ message: 'Login successful.', token: makeToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
}
export const login = (req, res, next) => signIn(req, res, next, 'alumni');
export const adminLogin = (req, res, next) => signIn(req, res, next, 'admin');
export async function me(req, res) { res.json({ user: req.user }); }
