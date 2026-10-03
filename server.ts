import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { Doctor, User, Appointment, Specialty } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const JWT_SECRET = process.env.JWT_SECRET || 'medibook-secret-key-123';

const rawSupabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dfihlbbnwjmozkkdwago.supabase.co').trim();
const SUPABASE_URL = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_Pnq4IGoKLv6mCtstFR7GGA_tVGWxvJ0').trim();
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Data files persistence paths - Use /tmp on Vercel for temporary write access
const REPO_DATA_DIR = path.join(__dirname, 'data');
const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'data') : REPO_DATA_DIR;
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.json');
const DOCTORS_FILE = path.join(DATA_DIR, 'doctors.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Seed demo accounts
const patientPasswordHash = bcrypt.hashSync('patient123', 10);
const adminPasswordHash = bcrypt.hashSync('admin123', 10);

const demoPatientId = 'p1111111-1111-4111-a111-111111111111';
const demoAdminId = 'a2222222-2222-4222-a222-222222222222';

const defaultUsers: (User & { password?: string })[] = [
  {
    id: demoPatientId,
    name: 'Sarah Jenkins',
    email: 'patient@medibook.com',
    role: 'patient',
    favoriteDoctorIds: ['f6321824-82c4-4b72-bfe1-6466b19d7695', '5c396bb6-9807-4552-beb2-79675ebf120e'],
    password: patientPasswordHash,
    createdAt: new Date().toISOString()
  },
  {
    id: demoAdminId,
    name: 'Clinic Administrator',
    email: 'admin@medibook.com',
    role: 'admin',
    favoriteDoctorIds: [],
    password: adminPasswordHash,
    createdAt: new Date().toISOString()
  }
];

const defaultAppointments: Appointment[] = [
  {
    id: 'apt-demo-1',
    patientId: demoPatientId,
    doctorId: 'f6321824-82c4-4b72-bfe1-6466b19d7695',
    doctorName: 'Dr. James Wilson',
    specialty: 'Cardiology',
    date: '2026-10-15',
    time: '10:00 AM',
    status: 'confirmed',
    patientPhone: '+1 (555) 234-5678',
    patientEmail: 'patient@medibook.com',
    notes: 'Annual cardiovascular routine checkup and blood pressure review.',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'apt-demo-2',
    patientId: demoPatientId,
    doctorId: '5c396bb6-9807-4552-beb2-79675ebf120e',
    doctorName: 'Dr. Sarah Chen',
    specialty: 'Dermatology',
    date: '2026-10-22',
    time: '02:00 PM',
    status: 'pending',
    patientPhone: '+1 (555) 234-5678',
    patientEmail: 'patient@medibook.com',
    notes: 'Consultation regarding seasonal dry skin and rash prevention.',
    createdAt: new Date().toISOString()
  }
];

// Helper to load persistent data
const loadUsers = (): (User & { password?: string })[] => {
  try {
    let targetFile = USERS_FILE;
    if (process.env.VERCEL && !fs.existsSync(USERS_FILE)) {
      const repoFile = path.join(REPO_DATA_DIR, 'users.json');
      if (fs.existsSync(repoFile)) targetFile = repoFile;
    }

    if (fs.existsSync(targetFile)) {
      const data = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
      // Ensure default demo users are always present
      for (const du of defaultUsers) {
        if (!data.some((u: any) => u.email === du.email)) {
          data.push(du);
        }
      }
      return data;
    }
  } catch (e) {
    console.error('Error loading users file:', e);
  }
  return [...defaultUsers];
};

const saveUsers = (users: (User & { password?: string })[]) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving users file:', e);
  }
};

const loadAppointments = (): Appointment[] => {
  try {
    let targetFile = APPOINTMENTS_FILE;
    if (process.env.VERCEL && !fs.existsSync(APPOINTMENTS_FILE)) {
      const repoFile = path.join(REPO_DATA_DIR, 'appointments.json');
      if (fs.existsSync(repoFile)) targetFile = repoFile;
    }

    if (fs.existsSync(targetFile)) {
      return JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading appointments file:', e);
  }
  return [...defaultAppointments];
};

const saveAppointments = (appointments: Appointment[]) => {
  try {
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(appointments, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving appointments file:', e);
  }
};

const defaultDoctors: Doctor[] = [
  {
    id: 'f6321824-82c4-4b72-bfe1-6466b19d7695', // Real Supabase UUID
    name: 'Dr. James Wilson',
    specialty: 'Cardiology',
    photoUrl: '/assets/images/doctor_cardiology_1791003731426.jpg',
    experience: 15,
    qualifications: ['MD - Cardiology', 'FACC'],
    fees: 150,
    rating: 4.9,
    availability: ['Monday', 'Wednesday', 'Friday'],
    about: 'Dr. James Wilson is a world-renowned cardiologist with over 15 years of experience in treating complex heart conditions. He is dedicated to providing personalized care to his patients.'
  },
  {
    id: '5c396bb6-9807-4552-beb2-79675ebf120e', // Real Supabase UUID
    name: 'Dr. Sarah Chen',
    specialty: 'Dermatology',
    photoUrl: '/assets/images/doctor_dermatology_1791003744157.jpg',
    experience: 10,
    qualifications: ['MD - Dermatology', 'Board Certified'],
    fees: 120,
    rating: 4.8,
    availability: ['Tuesday', 'Thursday', 'Saturday'],
    about: 'Dr. Sarah Chen specializes in medical and cosmetic dermatology. She believes in a holistic approach to skin health and uses the latest technology to achieve the best results.'
  },
  {
    id: '6a1bfe06-c2a8-4afe-b6ee-1893c1fe2884', // Real Supabase UUID
    name: 'Dr. Michael Brown',
    specialty: 'General Medicine',
    photoUrl: '/assets/images/doctor_general_1791003778534.jpg',
    experience: 20,
    qualifications: ['MD - Internal Medicine'],
    fees: 80,
    rating: 4.6,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    about: 'Dr. Michael Brown has over 20 years of experience in general medicine. He provides high-quality primary care and emphasizes preventive medicine.'
  },
  {
    id: '33333333-3333-4333-a333-333333333333',
    name: 'Dr. Robert Miller',
    specialty: 'Pediatrics',
    photoUrl: '/assets/images/doctor_pediatrics_1791003754715.jpg',
    experience: 12,
    qualifications: ['MD - Pediatrics', 'American Board of Pediatrics'],
    fees: 100,
    rating: 4.7,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    about: 'Dr. Robert Miller is passionate about child healthcare and development. He provides comprehensive care for children from infancy through adolescence.'
  },
  {
    id: '44444444-4444-4444-a444-444444444444',
    name: 'Dr. Elena Rodriguez',
    specialty: 'Neurology',
    photoUrl: '/assets/images/doctor_neurology_1791003767614.jpg',
    experience: 18,
    qualifications: ['MD - Neurology', 'PhD in Neurosciences'],
    fees: 200,
    rating: 4.9,
    availability: ['Monday', 'Wednesday', 'Thursday'],
    about: 'Dr. Elena Rodriguez is an expert in neurological disorders. Her research and clinical practice focus on innovative treatments for migraine and epilepsy.'
  }
];

const loadDoctors = (): Doctor[] => {
  try {
    let targetFile = DOCTORS_FILE;
    if (process.env.VERCEL && !fs.existsSync(DOCTORS_FILE)) {
      const repoFile = path.join(REPO_DATA_DIR, 'doctors.json');
      if (fs.existsSync(repoFile)) targetFile = repoFile;
    }

    if (fs.existsSync(targetFile)) {
      const data = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
      for (const dd of defaultDoctors) {
        if (!data.some((d: any) => d.id === dd.id || d.name === dd.name)) {
          data.push(dd);
        }
      }
      return data;
    }
  } catch (e) {
    console.error('Error loading doctors file:', e);
  }
  return [...defaultDoctors];
};

const saveDoctors = (doctors: Doctor[]) => {
  try {
    fs.writeFileSync(DOCTORS_FILE, JSON.stringify(doctors, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving doctors file:', e);
  }
};

// Doctors with real Supabase UUIDs
const db = {
  users: loadUsers(),
  doctors: loadDoctors(),
  appointments: loadAppointments(),
  specialties: [
    { id: '1', name: 'Cardiology', iconName: 'Heart' },
    { id: '2', name: 'Dermatology', iconName: 'Sun' },
    { id: '3', name: 'Pediatrics', iconName: 'Baby' },
    { id: '4', name: 'Neurology', iconName: 'Brain' },
    { id: '5', name: 'General Medicine', iconName: 'Stethoscope' }
  ] as Specialty[]
};

// Middleware for authentication
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes
interface PendingOtp {
  name: string;
  email: string;
  passwordHash: string;
  otp: string;
  expiresAt: number;
}
const pendingOtps = new Map<string, PendingOtp>();

interface PendingReset {
  email: string;
  otp: string;
  expiresAt: number;
}
const pendingResets = new Map<string, PendingReset>();

// Send 4-digit OTP to user's email for Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  db.users = loadUsers();
  const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  
  if (!user) {
    // For security, don't reveal if user exists, but we can't send email if they don't
    return res.status(404).json({ error: 'No account found with this email address.' });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  pendingResets.set(email.trim().toLowerCase(), {
    email: email.trim().toLowerCase(),
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000
  });

  console.log(`[MediBook Reset Service] Reset OTP sent to ${email}: ${otp}`);

  const smtpUser = process.env.SMTP_USER || 'agkkwa333@gmail.com';
  const smtpPass = (process.env.SMTP_PASS || 'kxuzxulzupxyftxw').replace(/\s+/g, '');

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: smtpUser, pass: smtpPass }
    });

    const simpleHtml = `<!DOCTYPE html><html><body style="font-family: sans-serif; line-height: 1.6; color: #1e293b; max-width: 520px; margin: 0 auto; padding: 20px;">
      <p>Hello,</p>
      <p>You requested to reset your MediBook password. Use the following verification code:</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 24px; text-align: center; margin: 20px 0;">
        <span style="font-size: 34px; font-weight: 700; letter-spacing: 8px; color: #1e293b; font-family: monospace;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #64748b;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
      <p style="font-size: 14px; color: #334155;">Thank you,<br><strong>MediBook Team</strong></p>
    </body></html>`;

    await transporter.sendMail({
      from: `"MediBook" <${smtpUser}>`,
      to: email.trim(),
      subject: `${otp} is your password reset code`,
      html: simpleHtml
    });
    res.json({ message: 'Reset code sent to your email.' });
  } catch (err) {
    console.error('SMTP error:', err);
    res.status(500).json({ error: 'Failed to send reset code. Please try again later.' });
  }
});

// Verify OTP and Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ error: 'All fields are required' });

  const pending = pendingResets.get(email.trim().toLowerCase());
  if (!pending || pending.otp !== otp || Date.now() > pending.expiresAt) {
    return res.status(400).json({ error: 'Invalid or expired reset code.' });
  }

  db.users = loadUsers();
  const userIndex = db.users.findIndex(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  db.users[userIndex].password = passwordHash;
  saveUsers(db.users);
  
  pendingResets.delete(email.trim().toLowerCase());
  res.json({ message: 'Password has been reset successfully.' });
});

// Send 4-digit OTP to user's email for Sign Up
app.post('/api/auth/send-signup-otp', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  db.users = loadUsers();
  if (db.users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return res.status(400).json({ error: 'This email is already registered. Please sign in instead.' });
  }

  // Generate 4-digit numeric OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const passwordHash = await bcrypt.hash(password, 10);

  pendingOtps.set(email.trim().toLowerCase(), {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  });

  console.log(`[MediBook Email Service] 4-digit OTP sent to ${email}: ${otp}`);

  // Send email via Gmail SMTP
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER || 'agkkwa333@gmail.com';
  const smtpPass = (process.env.SMTP_PASS || 'kxuzxulzupxyftxw').replace(/\s+/g, '');

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const plainText = `Hello,\n\nYour MediBook verification code is: ${otp}\n\nPlease enter this 4-digit code in the app to complete your registration.\nThis code will expire in 10 minutes.\n\nIf you did not request this code, please ignore this email.\n\nThank you,\nMediBook Team`;

    const simpleHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>MediBook Verification Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 520px; margin: 0 auto; padding: 20px;">
  <p style="font-size: 16px; margin: 0 0 16px 0;">Hello,</p>
  <p style="font-size: 16px; margin: 0 0 20px 0;">Your MediBook verification code is:</p>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 24px; text-align: center; margin: 20px 0;">
    <span style="font-size: 34px; font-weight: 700; letter-spacing: 8px; color: #1e293b; font-family: monospace;">${otp}</span>
  </div>
  <p style="font-size: 14px; color: #64748b; margin: 20px 0 8px 0;">This code will expire in 10 minutes. Please do not share this code with anyone.</p>
  <p style="font-size: 14px; color: #64748b; margin: 0 0 24px 0;">If you did not request this verification code, you can safely ignore this email.</p>
  <p style="font-size: 14px; color: #334155; margin: 0;">Thank you,<br><strong>MediBook Team</strong></p>
</body>
</html>`;

    const info = await transporter.sendMail({
      from: `"MediBook" <${smtpUser}>`,
      to: email.trim(),
      subject: `${otp} is your MediBook verification code`,
      text: plainText,
      html: simpleHtml
    });

    console.log(`[MediBook Email Service] Real OTP successfully sent to ${email}, messageId: ${info.messageId}`);
  } catch (emailErr) {
    console.error('SMTP send error:', emailErr);
  }

  res.json({
    success: true,
    message: `A 4-digit verification code has been sent to ${email}`
  });
});

// Verify 4-digit OTP and complete signup
app.post('/api/auth/verify-signup-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and 4-digit OTP are required' });
  }

  const record = pendingOtps.get(email.trim().toLowerCase());
  if (!record) {
    return res.status(400).json({ error: 'No pending registration found for this email. Please sign up again.' });
  }

  if (Date.now() > record.expiresAt) {
    pendingOtps.delete(email.trim().toLowerCase());
    return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
  }

  if (record.otp !== String(otp).trim()) {
    return res.status(400).json({ error: 'Invalid 4-digit verification code. Please check and try again.' });
  }

  // Create real user with real UUID
  db.users = loadUsers();
  const newUser: User & { password?: string } = {
    id: crypto.randomUUID(),
    name: record.name,
    email: record.email,
    role: 'patient',
    favoriteDoctorIds: [],
    password: record.passwordHash,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveUsers(db.users);
  pendingOtps.delete(email.trim().toLowerCase());

  // Sync to Supabase in background
  try {
    supabase.from('profiles').insert([{
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }]).then(({ error }) => {
      if (error) console.warn('Supabase profile sync notice:', error.message);
      else console.log('New verified patient profile synced to Supabase successfully!');
    });
  } catch (err) {
    console.warn('Supabase profile sync skipped:', err);
  }

  const token = jwt.sign({ id: newUser.id, role: newUser.role, email: newUser.email }, JWT_SECRET);
  res.json({
    success: true,
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      favoriteDoctorIds: newUser.favoriteDoctorIds
    }
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role = 'patient' } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  // Reload latest users from disk
  db.users = loadUsers();

  if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: User & { password?: string } = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    role,
    favoriteDoctorIds: [],
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveUsers(db.users);

  // Sync to Supabase in background
  try {
    supabase.from('profiles').insert([{
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }]).then(({ error }) => {
      if (error) console.warn('Supabase profile sync notice:', error.message);
      else console.log('User profile synced to Supabase successfully!');
    });
  } catch (err) {
    console.warn('Supabase profile sync skipped:', err);
  }

  const token = jwt.sign({ id: newUser.id, role: newUser.role, email: newUser.email }, JWT_SECRET);
  res.json({ 
    token, 
    user: { 
      id: newUser.id, 
      name: newUser.name, 
      email: newUser.email, 
      role: newUser.role, 
      favoriteDoctorIds: newUser.favoriteDoctorIds 
    } 
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Reload latest users from disk to ensure any newly registered user is found
  db.users = loadUsers();

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) as any;
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET);
  res.json({ 
    token, 
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      favoriteDoctorIds: user.favoriteDoctorIds || [] 
    } 
  });
});

app.get('/api/auth/me', authenticate, (req: any, res) => {
  db.users = loadUsers();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Doctor Routes
app.get('/api/doctors', (req, res) => {
  db.doctors = loadDoctors();
  const { specialty } = req.query;
  let filtered = db.doctors;
  if (specialty) {
    filtered = db.doctors.filter(d => d.specialty === specialty);
  }
  res.json(filtered);
});

app.get('/api/doctors/:id', (req, res) => {
  db.doctors = loadDoctors();
  const doctor = db.doctors.find(d => d.id === req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  res.json(doctor);
});

app.post('/api/doctors', authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only administrators can add doctors' });
  }

  const { name, specialty, photoUrl, experience, qualifications, fees, availability, about } = req.body;
  if (!name || !specialty) {
    return res.status(400).json({ error: 'Doctor name and specialty are required' });
  }

  const qualificationsList = Array.isArray(qualifications)
    ? qualifications
    : (qualifications ? String(qualifications).split(',').map(q => q.trim()).filter(Boolean) : ['MD']);

  const availabilityList = Array.isArray(availability) && availability.length > 0
    ? availability
    : ['Monday', 'Wednesday', 'Friday'];

  const newDoctor: Doctor = {
    id: crypto.randomUUID(),
    name,
    specialty,
    photoUrl: photoUrl || '/assets/images/doctor_cardiology_1791003731426.jpg',
    experience: Number(experience) || 5,
    qualifications: qualificationsList,
    fees: Number(fees) || 120,
    rating: 4.9,
    availability: availabilityList,
    about: about || `Dr. ${name} is an experienced medical specialist with proven clinical expertise.`
  };

  db.doctors = loadDoctors();
  db.doctors.push(newDoctor);
  saveDoctors(db.doctors);

  // Sync to Supabase in background
  try {
    supabase.from('doctors').insert([{
      id: newDoctor.id,
      name: newDoctor.name,
      specialty: newDoctor.specialty,
      photo_url: newDoctor.photoUrl,
      experience: newDoctor.experience,
      qualifications: newDoctor.qualifications,
      fees: newDoctor.fees,
      rating: newDoctor.rating,
      availability: newDoctor.availability,
      about: newDoctor.about
    }]).then(({ error }) => {
      if (error) console.warn('Supabase doctor sync notice:', error.message);
      else console.log('Doctor successfully added to Supabase!');
    });
  } catch (err) {
    console.warn('Supabase doctor sync skipped:', err);
  }

  res.status(201).json(newDoctor);
});

app.delete('/api/doctors/:id', authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  db.doctors = loadDoctors();
  const initialCount = db.doctors.length;
  db.doctors = db.doctors.filter(d => d.id !== req.params.id);
  if (db.doctors.length === initialCount) {
    return res.status(404).json({ error: 'Doctor not found' });
  }
  saveDoctors(db.doctors);
  res.json({ success: true, message: 'Doctor deleted' });
});

app.get('/api/specialties', (req, res) => {
  res.json(db.specialties);
});

// Appointment Routes
app.post('/api/appointments', authenticate, async (req: any, res) => {
  const { doctorId, date, time, notes, patientPhone, patientEmail, patientId } = req.body;
  const doctor = db.doctors.find(d => d.id === doctorId);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

  const patientEmailToUse = patientEmail || req.user.email || 'patient@medibook.com';

  // Always generate/assign a clean UUID for patient ID
  const isUserUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.user.id || '');
  const isValidIncomingPatientUuid = patientId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(patientId);
  const patientIdToUse = isValidIncomingPatientUuid 
    ? patientId 
    : (isUserUuid ? req.user.id : crypto.randomUUID());

  const newAppointment: Appointment = {
    id: crypto.randomUUID(),
    patientId: patientIdToUse,
    doctorId,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    date,
    time,
    status: 'pending',
    patientPhone: patientPhone || '',
    patientEmail: patientEmailToUse,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  // 1. Save to local persistent storage
  db.appointments = loadAppointments();
  db.appointments.unshift(newAppointment);
  saveAppointments(db.appointments);

  // 2. ALWAYS SEND TO SUPABASE DIRECTLY WITH PATIENT_ID
  try {
    const isDocUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doctorId);
    const { data: sbData, error: sbError } = await supabase
      .from('appointments')
      .insert([{
        id: newAppointment.id,
        patient_id: patientIdToUse, // Populated patient_id in Supabase
        doctor_id: isDocUuid ? doctorId : null,
        doctor_name: doctor.name,
        specialty: doctor.specialty,
        date,
        time,
        status: 'pending',
        patient_phone: patientPhone || '',
        patient_email: patientEmailToUse,
        notes: notes || ''
      }])
      .select();

    if (sbError) {
      console.warn('Supabase backend appointment insert notice:', sbError.message);
    } else {
      console.log('Appointment successfully saved to Supabase table with patient_id:', patientIdToUse);
    }
  } catch (sbErr) {
    console.warn('Supabase sync skipped gracefully:', sbErr);
  }

  res.json(newAppointment);
});

app.get('/api/appointments', authenticate, async (req: any, res) => {
  db.appointments = loadAppointments();
  let userAppointments: Appointment[] = [];

  if (req.user.role === 'admin') {
    userAppointments = [...db.appointments];
  } else {
    userAppointments = db.appointments.filter(
      a => a.patientId === req.user.id || (req.user.email && a.patientEmail?.toLowerCase() === req.user.email.toLowerCase())
    );
  }

  // Also query Supabase to merge any appointments booked directly in Supabase
  try {
    let sbQuery = supabase.from('appointments').select('*').order('created_at', { ascending: false });
    if (req.user.role !== 'admin' && req.user.email) {
      sbQuery = sbQuery.eq('patient_email', req.user.email.toLowerCase());
    }

    const { data: sbAppointments } = await sbQuery;
    if (sbAppointments && sbAppointments.length > 0) {
      for (const sbA of sbAppointments) {
        const alreadyExists = userAppointments.some(
          a => a.id === sbA.id || (a.date === sbA.date && a.time === sbA.time && a.doctorName === sbA.doctor_name)
        );
        if (!alreadyExists) {
          userAppointments.push({
            id: sbA.id,
            patientId: sbA.patient_id || req.user.id,
            doctorId: sbA.doctor_id || '',
            doctorName: sbA.doctor_name || 'Doctor',
            specialty: sbA.specialty || '',
            date: sbA.date,
            time: sbA.time,
            status: sbA.status || 'pending',
            patientPhone: sbA.patient_phone || '',
            patientEmail: sbA.patient_email || '',
            notes: sbA.notes || '',
            createdAt: sbA.created_at || new Date().toISOString()
          });
        }
      }
    }
  } catch (e) {
    console.warn('Error fetching Supabase appointments in backend:', e);
  }

  res.json(userAppointments);
});

app.patch('/api/appointments/:id', authenticate, (req: any, res) => {
  const { status } = req.body;
  const appointment = db.appointments.find(a => a.id === req.params.id);
  if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

  // Only admin or the patient can cancel/update status
  if (req.user.role !== 'admin' && appointment.patientId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  appointment.status = status;
  res.json(appointment);
});

// User Routes
app.post('/api/users/favorites', authenticate, (req: any, res) => {
  const { doctorId } = req.body;
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  if (!user.favoriteDoctorIds) user.favoriteDoctorIds = [];
  
  const index = user.favoriteDoctorIds.indexOf(doctorId);
  if (index === -1) {
    user.favoriteDoctorIds.push(doctorId);
  } else {
    user.favoriteDoctorIds.splice(index, 1);
  }
  
  res.json({ favoriteDoctorIds: user.favoriteDoctorIds });
});

// Admin Stats
app.get('/api/admin/stats', authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  res.json({
    totalDoctors: db.doctors.length,
    totalPatients: db.users.filter(u => u.role === 'patient').length,
    totalAppointments: db.appointments.length,
    pendingAppointments: db.appointments.filter(a => a.status === 'pending').length
  });
});

// Serve static assets or mount Vite middleware
if (process.env.VERCEL) {
  // On Vercel, static files are handled by vercel.json rewrites.
  // This Express app should only handle /api routes.
} else if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Use a completely dynamic import for vite to avoid bundling it in production
  import('vite').then(async (viteModule) => {
    const vite = await viteModule.createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      if (req.url.startsWith('/api')) return next();
      try {
        const html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        const transformedHtml = await vite.transformIndexHtml(req.url, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(transformedHtml);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }).catch(err => {
    console.error('Failed to load Vite in dev mode:', err);
  });
}

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
