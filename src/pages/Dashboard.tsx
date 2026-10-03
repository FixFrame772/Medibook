import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Appointment, Doctor } from '../types.ts';
import { supabase } from '../lib/supabase.ts';
import { normalizeAppointment, normalizeDoctor } from '../lib/normalizers.ts';
import { Calendar, Clock, User as UserIcon, CheckCircle2, XCircle, Clock4, ChevronRight, MessageSquare, Heart } from 'lucide-react';
import { formatDate, cn } from '../lib/utils.ts';
import { motion } from 'motion/react';
import DoctorCard from '../components/DoctorCard.tsx';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [favoriteDoctors, setFavoriteDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <UserIcon className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">{user?.name}</h2>
              <p className="text-sm text-slate-400 mb-6">{user?.email}</p>
              <div className="pt-6 border-t border-slate-100 flex justify-center gap-8">
                <div className="text-center">
                  <span className="block text-xl font-bold text-slate-900">{appointments.length}</span>
                  <span className="text-xs text-slate-400 uppercase">Total</span>
                </div>
                <div className="text-center">
                  <span className="block text-xl font-bold text-slate-900">
                    {appointments.filter(a => a.status === 'pending').length}
                  </span>
                  <span className="text-xs text-slate-400 uppercase">Pending</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 p-8 rounded-3xl shadow-xl text-white">
              <h3 className="font-bold mb-4">Need Help?</h3>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed opacity-80">
                Our support team is available 24/7 for any urgent queries or appointment rescheduling assistance.
              </p>
              <button className="w-full py-3 bg-white text-blue-600 rounded-xl text-sm font-bold shadow-sm">
                Contact Support
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
                        <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
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
      </div>
    </div>
  );
};

export default Dashboard;
