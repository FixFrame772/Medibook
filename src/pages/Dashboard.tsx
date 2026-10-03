import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Appointment, Doctor } from '../types.ts';
import { supabase } from '../lib/supabase.ts';
import { normalizeAppointment, normalizeDoctor } from '../lib/normalizers.ts';
import { Calendar, Clock, User as UserIcon, CheckCircle2, XCircle, Clock4, ChevronRight, MessageSquare, Heart, Mail, Phone, Printer, X, Headset } from 'lucide-react';
import { formatDate, cn } from '../lib/utils.ts';
import { motion, AnimatePresence } from 'motion/react';
import DoctorCard from '../components/DoctorCard.tsx';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [favoriteDoctors, setFavoriteDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch appointments from backend API
        let localAppointments: Appointment[] = [];
        if (token) {
          const res = await fetch('/api/appointments', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            localAppointments = data.map(normalizeAppointment);
          }
        }

        // 2. Fetch doctors from backend API
        let allDoctorsList: Doctor[] = [];
        const doctorsRes = await fetch('/api/doctors');
        if (doctorsRes.ok) {
          const data = await doctorsRes.json();
          allDoctorsList = data.map(normalizeDoctor);
        }

        // 3. Fetch from Supabase appointments table directly
        let sbAppointmentsList: Appointment[] = [];
        try {
          let sbQuery = supabase.from('appointments').select('*').order('created_at', { ascending: false });
          if (user?.email) {
            sbQuery = sbQuery.eq('patient_email', user.email.toLowerCase());
          }
          const { data: sbAppointments } = await sbQuery;

          if (sbAppointments && sbAppointments.length > 0) {
            sbAppointmentsList = sbAppointments.map(normalizeAppointment);
          }
        } catch (sbErr) {
          console.warn('Supabase appointments fetch notice:', sbErr);
        }

        // Merge appointments cleanly
        const combinedAppointments = [...localAppointments];
        for (const sbAppt of sbAppointmentsList) {
          const exists = combinedAppointments.some(
            a => a.id === sbAppt.id || (a.date === sbAppt.date && a.time === sbAppt.time && a.doctorName === sbAppt.doctorName)
          );
          if (!exists) {
            combinedAppointments.push(sbAppt);
          }
        }

        combinedAppointments.sort((a, b) => 
          new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
        );
        setAppointments(combinedAppointments);

        // Calculate favorite doctors
        if (user?.favoriteDoctorIds && user.favoriteDoctorIds.length > 0) {
          const favs = allDoctorsList.filter(d => user.favoriteDoctorIds.includes(d.id));
          setFavoriteDoctors(favs);
        } else {
          setFavoriteDoctors([]);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, user?.favoriteDoctorIds, user?.id, user?.email]);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Clock4 className="h-4 w-4" />;
    }
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Dashboard</h1>
          <p className="text-slate-500 text-lg">Manage your appointments and medical records</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* User Summary Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-slate-200">
                <UserIcon className="h-10 w-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">{user?.name}</h2>
              <p className="text-xs text-slate-500 mb-6">{user?.email}</p>
              
              <div className="w-full pt-6 border-t border-slate-100 space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Account Number</span>
                  <span className="font-mono text-blue-700 font-bold tracking-wider">{user?.patientRegId || 'PENDING'}</span>
                </div>
                
                <div className="flex justify-between items-center px-2 pt-2">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-slate-900">{appointments.length}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Total</span>
                  </div>
                  <div className="h-8 w-px bg-slate-200"></div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-slate-900">
                      {appointments.filter(a => a.status === 'pending').length}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl shadow-xl text-white">
              <div className="flex items-center gap-3 mb-4">
                <Headset className="h-5 w-5 text-blue-400" />
                <h3 className="font-bold text-sm">System Support</h3>
              </div>
              <p className="text-slate-400 text-[11px] mb-6 leading-relaxed">
                Contact our support desk for technical assistance or billing inquiries. Available 24/7.
              </p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-support-chat'))}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-lg"
              >
                Open Support Ticket
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-2 px-1">Control Panel</h4>
              <button className="w-full flex items-center justify-between p-2 text-xs text-slate-600 hover:text-blue-600 transition-colors border-b border-slate-50 pb-3">
                <span className="flex items-center gap-2"><UserIcon className="h-3.5 w-3.5 text-slate-400" /> Account Profile</span>
                <ChevronRight className="h-3 w-3" />
              </button>
              <button className="w-full flex items-center justify-between p-2 text-xs text-slate-600 hover:text-blue-600 transition-colors border-b border-slate-50 pb-3">
                <span className="flex items-center gap-2"><Printer className="h-3.5 w-3.5 text-slate-400" /> Export Medical History</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </aside>

          {/* Main Content: Appointments List */}
          <div className="lg:col-span-3 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" /> Recent Appointments
            </h3>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse border border-slate-200"></div>)}
              </div>
            ) : appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appt) => (
                  <motion.div 
                    key={appt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                          <UserIcon className="h-8 w-8" />
                        </div>
                        <div>
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-2",
                            getStatusStyle(appt.status)
                          )}>
                            {getStatusIcon(appt.status)}
                            {appt.status.toUpperCase()}
                          </span>
                          <h4 className="text-lg font-bold text-slate-900">{appt.doctorName}</h4>
                          <p className="text-sm text-slate-500 font-medium">{appt.specialty}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:flex md:items-center gap-8 text-sm">
                        <div className="space-y-1">
                          <span className="text-xs text-slate-400 block uppercase">Date</span>
                          <div className="flex items-center gap-2 text-slate-700 font-semibold">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            {formatDate(appt.date)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-slate-400 block uppercase">Time</span>
                          <div className="flex items-center gap-2 text-slate-700 font-semibold">
                            <Clock className="h-4 w-4 text-blue-600" />
                            {appt.time}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {appt.notes && (
                          <button 
                            className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors"
                            title="View Notes"
                          >
                            <MessageSquare className="h-5 w-5" />
                          </button>
                        )}
                        {appt.status === 'pending' && (
                          <button 
                            onClick={() => handleCancel(appt.id)}
                            className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all"
                          >
                            Cancel
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedAppointment(appt)}
                          className="p-2.5 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-all"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-20 rounded-3xl text-center border border-slate-100">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No appointments yet</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Start your healthcare journey by booking an appointment with one of our expert doctors.</p>
                <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold">
                  Browse Doctors
                </button>
              </div>
            )}
          </div>
        </div>

        {/* My Favorites Section */}
        {!isLoading && (
          <div className="mt-16">
            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500 fill-red-500" /> My Favorite Doctors
            </h3>
            
            {favoriteDoctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {favoriteDoctors.map((doc) => (
                  <DoctorCard key={doc.id} doctor={doc} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl text-center border border-slate-100">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-slate-500">You haven't saved any doctors to your favorites yet.</p>
              </div>
            )}
          </div>
        )}

        {/* System Info Footer - Classic PHP Style */}
        <div className="mt-12 pt-6 border-t border-slate-200">
          <div className="flex flex-wrap justify-between items-center gap-4 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            <div className="flex gap-4">
              <span>System Version: v2.4.1-stable</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Session ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
            </div>
            <div className="flex gap-4 items-center">
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure Node</span>
              <span>•</span>
              <span>Client Hash: {user?.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal (Replicated from Admin for consistency) */}
      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Booking Receipt</span>
                  <h3 className="text-lg font-bold text-slate-900">Appointment Details</h3>
                </div>
                <button 
                  onClick={() => setSelectedAppointment(null)}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Appointment Reference ID</span>
                    <span className="font-mono text-base font-bold text-slate-800 break-all leading-tight">
                      {selectedAppointment.patientRegId || 'N/A'}
                    </span>
                  </div>
                  <div className="shrink-0">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold border",
                      getStatusStyle(selectedAppointment.status)
                    )}>
                      {selectedAppointment.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Doctor</span>
                    <span className="font-bold text-slate-900 text-sm block leading-tight">{selectedAppointment.doctorName}</span>
                    <span className="text-xs text-blue-600 font-bold">{selectedAppointment.specialty}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Scheduled Time</span>
                    <span className="font-bold text-slate-900 text-sm block leading-tight">{formatDate(selectedAppointment.date)}</span>
                    <span className="text-xs text-slate-600 font-bold">{selectedAppointment.time}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Symptoms / Notes</span>
                  <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[80px] leading-relaxed">
                    {selectedAppointment.notes || 'No notes provided for this appointment.'}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={() => window.print()}
                    className="w-full sm:w-auto px-5 py-3 border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2.5 shadow-sm"
                  >
                    <Printer className="h-4 w-4" />
                    Print Ticket
                  </button>

                  {selectedAppointment.status === 'pending' && (
                    <button
                      onClick={() => { handleCancel(selectedAppointment.id); setSelectedAppointment(null); }}
                      className="w-full sm:w-auto px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-xs font-bold transition-all"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
