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
  Stethoscope,
  Shield,
  FileText
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
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [deletingDoctorId, setDeletingDoctorId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
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

  if (isLoading && token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <AdminLoginGate onLoginSuccess={() => fetchData()} />;
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* System Status Header - Traditional PHP/SQL System Style */}
      <div className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5"><Activity className="h-3 w-3 text-emerald-400" /> DB_STATUS: STABLE</span>
          <span className="flex items-center gap-1.5"><Shield className="h-3 w-3 text-blue-400" /> AUTH_NODE: SECURE</span>
          <span className="hidden sm:inline text-slate-500">REGION: ASIA-SOUTH-1</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">ADMIN_SESSION: {user?.name.toUpperCase()}</span>
        </div>
      </div>

      <div className="flex-grow py-10">
        <div className="container mx-auto px-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">System Control Panel</h1>
              <p className="text-slate-500 text-sm font-medium">MediBook Administrative Data Core and Registry Management</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/admin/appointments"
                className="px-5 py-3 bg-white border border-slate-300 text-slate-700 hover:text-blue-600 rounded text-[11px] font-black flex items-center gap-2.5 shadow-sm transition-all uppercase tracking-widest"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Open Data_Registry</span>
                <ExternalLink className="h-3 w-3" />
              </Link>

              <button 
                onClick={() => setIsAddDoctorOpen(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-black flex items-center gap-2.5 shadow-md transition-all uppercase tracking-widest"
              >
                <UserPlus className="h-3.5 w-3.5" /> 
                <span>Add_New_Specialist</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'Specialist Registry', value: stats?.totalDoctors || doctors.length, icon: <Stethoscope />, color: 'bg-slate-100 text-slate-700' },
              { label: 'Patient Database', value: stats?.totalPatients || 0, icon: <Users />, color: 'bg-slate-100 text-slate-700' },
              { label: 'System_Bookings', value: stats?.totalAppointments || appointments.length, icon: <Calendar />, color: 'bg-slate-100 text-slate-700' },
              { label: 'Awaiting_Action', value: stats?.pendingAppointments || appointments.filter(a => a.status === 'pending').length, icon: <Activity />, color: 'bg-slate-100 text-slate-700' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 border border-slate-200 shadow-sm rounded">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("w-8 h-8 rounded flex items-center justify-center border border-slate-100", stat.color)}>
                    {React.cloneElement(stat.icon as React.ReactElement<any>, { className: 'h-4 w-4' })}
                  </div>
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                </div>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Appointments */}
            <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm overflow-hidden rounded">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Recent_Activity_Log</h2>
                <Link to="/admin/appointments" className="text-[10px] font-black text-blue-600 uppercase hover:underline">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-3">Client</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.slice(0, 8).map((appt) => (
                      <tr key={appt.id} className="text-xs hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 block">{appt.patientEmail}</span>
                          <span className="text-[9px] font-mono text-slate-400">ID: {appt.patientRegId || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4 uppercase font-black text-[9px] tracking-tighter">
                          <span className={cn(
                            appt.status === 'confirmed' ? "text-emerald-600" :
                            appt.status === 'cancelled' ? "text-red-600" : "text-orange-500"
                          )}>{appt.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link to="/admin/appointments" className="p-1 text-slate-400 hover:text-blue-600 inline-block"><ArrowUpRight className="h-4 w-4" /></Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Doctors Quick List */}
            <div className="bg-white border border-slate-200 shadow-sm rounded">
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Specialist_Registry</h2>
              </div>
              <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {doctors.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded hover:border-blue-100 transition-colors">
                    <img src={doc.photoUrl} alt={doc.name} className="w-10 h-10 rounded border border-slate-200 grayscale-[50%]" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-black text-slate-900 uppercase truncate">{doc.name}</h4>
                      <p className="text-[9px] text-blue-600 font-bold uppercase tracking-tighter">{doc.specialty}</p>
                    </div>
                    <button onClick={() => handleDeleteDoctor(doc.id, doc.name)} className="text-slate-300 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

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
