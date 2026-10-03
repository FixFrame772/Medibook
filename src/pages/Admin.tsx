import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Appointment, Doctor } from '../types.ts';
import { normalizeDoctor } from '../lib/normalizers.ts';
import { AddDoctorModal } from '../components/AddDoctorModal.tsx';
import { AdminLoginGate } from '../components/AdminLoginGate.tsx';
import { 
  Users, 
  Calendar, 
  UserPlus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  MoreVertical, 
  Activity, 
  ArrowUpRight,
  Trash2,
  ExternalLink,
  Award,
  Stethoscope
} from 'lucide-react';
import { formatDate, formatCurrency, cn } from '../lib/utils.ts';
import { motion } from 'motion/react';

interface Stats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  pendingAppointments: number;
}

const Admin = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed'>('all');
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [deletingDoctorId, setDeletingDoctorId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!token) return;
    try {
      const [statsRes, apptsRes, docsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/appointments', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/doctors')
      ]);
      if (statsRes.ok && apptsRes.ok) {
        const statsData = await statsRes.json();
        const apptsData = await apptsRes.json();
        setStats(statsData);
        setAppointments(apptsData.sort((a: Appointment, b: Appointment) => 
          new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
        ));
      }
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDoctors(docsData.map(normalizeDoctor));
      }
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: status as any } : a));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteDoctor = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    setDeletingDoctorId(id);
    try {
      const res = await fetch(`/api/doctors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDoctors(prev => prev.filter(d => d.id !== id));
        setStats(prev => prev ? { ...prev, totalDoctors: Math.max(0, prev.totalDoctors - 1) } : null);
      }
    } catch (err) {
      console.error('Error deleting doctor:', err);
    } finally {
      setDeletingDoctorId(null);
    }
  };

  const handleDoctorAdded = (newDoc: Doctor) => {
    setDoctors(prev => [newDoc, ...prev]);
    setStats(prev => prev ? { ...prev, totalDoctors: prev.totalDoctors + 1 } : null);
  };

  const filteredAppointments = appointments.filter(a => 
    activeTab === 'all' ? true : a.status === activeTab
  );

  if (!user || user.role !== 'admin') {
    return <AdminLoginGate onLoginSuccess={() => fetchData()} />;
  }

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6">
        
        {/* Header & Quick Action */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
            <p className="text-slate-500">Overview of MediBook platform activities, doctors, and patient bookings</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/admin/appointments"
              className="px-5 py-3 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 rounded-2xl font-bold flex items-center gap-2.5 shadow-sm transition-all text-sm hover:border-blue-200"
            >
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Open Dedicated Appointments Page</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </Link>

            <button 
              onClick={() => setIsAddDoctorOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center gap-2.5 shadow-md shadow-blue-500/10 transition-all text-sm"
            >
              <UserPlus className="h-4 w-4" /> 
              <span>Add New Doctor</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { 
              label: 'Total Doctors', 
              value: stats?.totalDoctors || doctors.length, 
              icon: <UserPlus />, 
              color: 'bg-blue-50 text-blue-600',
              link: '#doctors-section'
            },
            { 
              label: 'Total Patients', 
              value: stats?.totalPatients || 0, 
              icon: <Users />, 
              color: 'bg-emerald-50 text-emerald-600' 
            },
            { 
              label: 'All Appointments', 
              value: stats?.totalAppointments || appointments.length, 
              icon: <Calendar />, 
              color: 'bg-purple-50 text-purple-600',
              link: '/admin/appointments'
            },
            { 
              label: 'Pending Requests', 
              value: stats?.pendingAppointments || appointments.filter(a => a.status === 'pending').length, 
              icon: <Activity />, 
              color: 'bg-orange-50 text-orange-600',
              link: '/admin/appointments'
            }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.color)}>
                  {React.cloneElement(stat.icon as React.ReactElement<any>, { className: 'h-6 w-6' })}
                </div>
                {stat.link && (
                  <Link 
                    to={stat.link} 
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Manage <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
              <span className="block text-slate-500 text-sm font-medium mb-1">{stat.label}</span>
              <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Doctors Management Section */}
        <div id="doctors-section" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Registered Doctors Directory</h2>
              <p className="text-slate-500 text-sm">Add doctors with custom photo from device, name, degree, and fee</p>
            </div>
            <button
              onClick={() => setIsAddDoctorOpen(true)}
              className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Add Doctor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div 
                key={doc.id}
                className="bg-slate-50 rounded-2xl p-5 border border-slate-200 hover:border-blue-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-3">
                    <img 
                      src={doc.photoUrl} 
                      alt={doc.name} 
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-sm bg-white"
                    />
                    <div className="flex-grow min-w-0">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block truncate">
                        {doc.specialty}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base truncate">{doc.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Award className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.qualifications?.join(', ') || 'MD'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-200/60 mb-3">
                    <div>
                      <span className="text-slate-400 block">Experience</span>
                      <span className="font-bold text-slate-700">{doc.experience} Years</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Fee</span>
                      <span className="font-bold text-slate-700">{formatCurrency(doc.fees)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Link 
                    to={`/doctors/${doc.id}`}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View Profile <ExternalLink className="h-3 w-3" />
                  </Link>

                  <button
                    onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                    disabled={deletingDoctorId === doc.id}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Doctor"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Appointments Overview */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recent Appointments</h2>
              <p className="text-slate-500 text-sm">Quick overview of appointments booked through MediBook</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link 
                to="/admin/appointments"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Open Dedicated Appointments Page</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Patient / Contact</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Doctor</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Schedule</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-6 h-16 bg-slate-50/20"></td>
                    </tr>
                  ))
                ) : filteredAppointments.slice(0, 5).map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4 font-bold text-slate-900 text-sm">
                      {appt.patientEmail || 'Patient'}
                      {appt.patientPhone && <span className="block text-xs font-normal text-slate-500">{appt.patientPhone}</span>}
                    </td>
                    <td className="px-8 py-4">
                      <span className="font-semibold text-slate-800 text-sm block">{appt.doctorName}</span>
                      <span className="text-xs text-blue-600">{appt.specialty}</span>
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-600 font-medium">
                      {formatDate(appt.date)} • {appt.time}
                    </td>
                    <td className="px-8 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                        appt.status === 'confirmed' ? "bg-emerald-50 text-emerald-600" :
                        appt.status === 'cancelled' ? "bg-red-50 text-red-600" :
                        appt.status === 'completed' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                      )}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {appt.status === 'pending' && (
                          <button 
                            onClick={() => updateStatus(appt.id, 'confirmed')}
                            className="px-3.5 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold transition-all border border-emerald-200/60 flex items-center gap-1.5 shadow-xs" 
                            title="Confirm"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Confirm</span>
                          </button>
                        )}
                        {appt.status !== 'cancelled' && (
                          <button 
                            onClick={() => updateStatus(appt.id, 'cancelled')}
                            className="px-3.5 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition-all border border-red-200/60 flex items-center gap-1.5 shadow-xs" 
                            title="Cancel"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add Doctor Modal */}
      <AddDoctorModal 
        isOpen={isAddDoctorOpen}
        onClose={() => setIsAddDoctorOpen(false)}
        onDoctorAdded={handleDoctorAdded}
        token={token}
      />
    </div>
  );
};

export default Admin;
