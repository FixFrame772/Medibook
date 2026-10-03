
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'admin';
  favoriteDoctorIds: string[];
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  photoUrl: string;
  experience: number;
  qualifications: string[];
  fees: number;
  rating: number;
  availability: string[]; // e.g., ["Monday", "Wednesday", "Friday"]
  about: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  patientPhone: string;
  patientEmail: string;
  notes?: string;
  createdAt: string;
}

export interface Specialty {
  id: string;
  name: string;
  iconName: string;
}
