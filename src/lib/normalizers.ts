import { Doctor, Appointment } from '../types.ts';

export const normalizeDoctor = (d: any): Doctor => ({
  id: d.id,
  name: d.name,
  specialty: d.specialty,
  photoUrl: d.photoUrl || d.photo_url || '/src/assets/images/doctor_cardiology_1791003731426.jpg',
  experience: typeof d.experience === 'number' ? d.experience : 10,
  qualifications: Array.isArray(d.qualifications) ? d.qualifications : ['MD - Specialist'],
  fees: Number(d.fees) || 120,
  rating: Number(d.rating) || 4.8,
  availability: Array.isArray(d.availability) ? d.availability : ['Monday', 'Wednesday', 'Friday'],
  about: d.about || 'Experienced healthcare specialist dedicated to patient wellness.'
});

export const normalizeAppointment = (a: any): Appointment => ({
  id: a.id,
  patientId: a.patientId || a.patient_id || '',
  doctorId: a.doctorId || a.doctor_id || '',
  doctorName: a.doctorName || a.doctor_name || 'Medical Specialist',
  specialty: a.specialty || 'General',
  date: a.date,
  time: a.time,
  status: a.status || 'pending',
  patientPhone: a.patientPhone || a.patient_phone || '',
  patientEmail: a.patientEmail || a.patient_email || '',
  notes: a.notes || '',
  createdAt: a.createdAt || a.created_at || new Date().toISOString()
});
