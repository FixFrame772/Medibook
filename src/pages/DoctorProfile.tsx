import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Appointment, Doctor } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { normalizeDoctor } from '../lib/normalizers.ts';
import { BouncingDots } from '../components/BouncingDots.tsx';
import { 
  Star, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Shield, 
  Mail, 
  Phone, 
  FileText, 
  Download, 
  Printer, 
  Loader2, 
  Heart 
} from 'lucide-react';
import { formatDate, formatCurrency, cn } from '../lib/utils.ts';
import { motion, AnimatePresence } from 'motion/react';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, toggleFavorite } = useAuth();
  const bookingCardRef = useRef<HTMLDivElement>(null);
  const isFavorite = user?.favoriteDoctorIds?.includes(id || '');
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<Appointment | null>(null);
  const [error, setError] = useState('');

  // Scroll to booking card on state change
  useEffect(() => {
    if (isSubmitting || successData) {
      setTimeout(() => {
        bookingCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [isSubmitting, successData]);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '');
        
        if (isUuid) {
          // Try Supabase first if it's a valid UUID
          const { data, error: sbError } = await supabase
            .from('doctors')
            .select('*')
            .eq('id', id)
            .single();

          if (data) {
            setDoctor(normalizeDoctor(data));
            setIsLoading(false);
            return;
          }
        }

        // Fallback to backend API
        const res = await fetch(`/api/doctors/${id}`);
        if (res.ok) {
          const localData = await res.json();
          setDoctor(normalizeDoctor(localData));
        } else {
          navigate('/doctors');
        }
      } catch (err) {
        console.error('Error fetching doctor:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctor();
  }, [id, navigate]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/doctors/${id}` } } });
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const isUserUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user?.id || '');
      const patientIdToUse = isUserUuid ? user.id : crypto.randomUUID();

      // 1. Primary: Save to backend database API (Guaranteed persistent and also syncs to Supabase on server)
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: id,
          patientId: patientIdToUse,
          date: bookingDate,
          time: bookingTime,
          patientPhone: phoneNumber,
          patientEmail: email,
          notes
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to book appointment');
      }

      const bookedAppointment: Appointment = await res.json();
      setSuccessData(bookedAppointment);

      // 2. Secondary: Also directly insert to Supabase client from browser for instant sync
      try {
        const isDocUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '');

        const supabasePayload: Record<string, any> = {
          patient_id: patientIdToUse,
          doctor_name: doctor?.name,
          specialty: doctor?.specialty,
          date: bookingDate,
          time: bookingTime,
          patient_phone: phoneNumber,
          patient_email: email,
          notes: notes || '',
          status: 'pending'
        };

        if (isDocUuid) supabasePayload.doctor_id = id;

        const { data: sbRes, error: sbError } = await supabase
          .from('appointments')
          .insert([supabasePayload])
          .select();

        if (sbError) {
          console.warn('Frontend Supabase appointment insert notice:', sbError.message);
        } else {
          console.log('Frontend Supabase appointment confirmed with ID and patient_id:', sbRes?.[0]?.id, patientIdToUse);
        }
      } catch (sbErr) {
        console.warn('Supabase direct insert skipped gracefully:', sbErr);
      }

    } catch (err: any) {
      console.error('Booking Error:', err);
      setError(err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Doctors
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Doctor Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-48 aspect-square rounded-2xl overflow-hidden shadow-md shrink-0">
                <img src={doctor.photoUrl} alt={doctor.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-2 inline-block">
                      {doctor.specialty}
                    </span>
                    <h1 className="text-3xl font-bold text-slate-900">{doctor.name}</h1>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl border border-yellow-100">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{doctor.rating}</span>
                      <span className="text-sm opacity-70">(120+ Reviews)</span>
                    </div>
                    {user && (
                      <button 
                        onClick={() => toggleFavorite(doctor.id)}
                        className={cn(
                          "p-3 rounded-xl border transition-all shadow-sm",
                          isFavorite 
                            ? "bg-red-500 border-red-500 text-white" 
                            : "bg-white border-slate-200 text-slate-400 hover:text-red-500"
                        )}
                        title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                      >
                        <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-6 text-sm text-slate-500 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{doctor.experience} Years Experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Verified Professional</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {doctor.qualifications.map((q, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-medium">
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About Doctor</h2>
              <p className="text-slate-500 leading-relaxed">
                {doctor.about}
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Availability</h2>
              <div className="flex flex-wrap gap-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <div 
                    key={day}
                    className={cn(
                      "px-4 py-3 rounded-2xl text-sm font-semibold border flex flex-col items-center gap-1",
                      doctor.availability.includes(day)
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-slate-50 border-slate-100 text-slate-300"
                    )}
                  >
                    <span>{day}</span>
                    {doctor.availability.includes(day) && <span className="text-[10px] uppercase opacity-70">Available</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div ref={bookingCardRef} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl sticky top-24 overflow-hidden">
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-20 text-center flex flex-col items-center justify-center"
                  >
                    <div className="relative mb-8">
                      <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-blue-600 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Processing Appointment</h3>
                    <p className="text-slate-500 text-sm">Verifying schedule and generating medical slip...</p>
                    
                    <div className="mt-6 flex flex-col items-center gap-3">
                      <BouncingDots className="text-blue-600" size="lg" />
                    </div>
                  </motion.div>
                ) : successData ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col"
                  >
                    <div className="flex items-center gap-2 mb-6 text-emerald-600 font-bold">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Appointment Confirmed</span>
                    </div>

                    {/* Medical Slip */}
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 relative">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r-2 border-slate-200"></div>
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l-2 border-slate-200"></div>
                      
                      <div className="text-center pb-4 border-b border-slate-200 mb-4">
                        <span className="text-[10px] font-bold text-blue-600 tracking-[0.2em] uppercase">MediBook Appointment Slip</span>
                        <div className="text-xs text-slate-400 font-mono mt-1">Ref: {successData.id.toUpperCase()}</div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Doctor</span>
                          <div className="text-right">
                            <div className="text-sm font-bold text-slate-900">{successData.doctorName}</div>
                            <div className="text-[10px] text-blue-600 font-medium">{successData.specialty}</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-start">
                          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Patient Details</span>
                          <div className="text-right">
                            <div className="text-sm font-bold text-slate-900">{user?.name}</div>
                            <div className="text-[11px] font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md inline-block my-0.5 border border-blue-100">
                              Patient ID: {successData.patientId || user?.id}
                            </div>
                            <div className="text-[10px] text-slate-500">{successData.patientEmail}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="p-3 bg-white rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Date</span>
                            <span className="text-xs font-bold text-slate-900">{formatDate(successData.date)}</span>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Time</span>
                            <span className="text-xs font-bold text-slate-900">{successData.time}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Contact</span>
                          <span className="text-xs font-bold text-slate-900">{successData.patientPhone}</span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-200 text-center">
                        <div className="text-[10px] text-slate-400 mb-2">Please present this slip at the reception</div>
                        <div className="flex items-center justify-center gap-1.5 py-1">
                          {[...Array(20)].map((_, i) => (
                            <div key={i} className="w-0.5 h-6 bg-slate-300"></div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-8">
                      <button className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                        <Printer className="h-4 w-4" /> Print
                      </button>
                      <button className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                        <Download className="h-4 w-4" /> Save
                      </button>
                    </div>

                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="w-full mt-4 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-100"
                    >
                      Go to Dashboard
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Book Appointment</h3>
                    
                    <form onSubmit={handleBooking} className="space-y-6">
                      <div className="p-4 bg-blue-50 rounded-2xl flex items-center justify-between border border-blue-100">
                        <span className="text-blue-700 font-medium">Consultation Fee</span>
                        <span className="text-2xl font-bold text-blue-700">{formatCurrency(doctor.fees)}</span>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2.5">Select Appointment Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input 
                            type="date" 
                            required
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-slate-800"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <label className="block text-sm font-bold text-slate-700">Select Time Slot</label>
                          {bookingTime && (
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg">
                              Selected: {bookingTime}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(time => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setBookingTime(time)}
                              className={cn(
                                "py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center",
                                bookingTime === time
                                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-[1.02]"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                              )}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                        {!bookingTime && (
                          <p className="text-[11px] text-slate-400 mt-2">Please tap any available time slot above</p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input 
                              type="email" 
                              required
                              placeholder="your@email.com"
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input 
                              type="tel" 
                              required
                              placeholder="+1 (555) 000-0000"
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Notes (Optional)</label>
                        <textarea 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none text-sm"
                          placeholder="Briefly describe your symptoms..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm border border-red-100">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-3 text-base disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <BouncingDots className="text-white" size="md" />
                            <span>Confirming Appointment...</span>
                          </>
                        ) : (
                          <span>Confirm & Book Appointment</span>
                        )}
                      </button>
                      <p className="text-[10px] text-center text-slate-400 px-4">
                        By clicking Confirm, you agree to our terms of service and consultation policy.
                      </p>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
