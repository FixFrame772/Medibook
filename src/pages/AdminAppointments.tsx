import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Appointment } from '../types.ts';
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Download, 
  Printer, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  RefreshCw,
  Eye,
  X,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils.ts';
import { motion, AnimatePresence } from 'motion/react';
import { BouncingDots } from '../components/BouncingDots.tsx';
import { AdminLoginGate } from '../components/AdminLoginGate.tsx';

const AdminAppointments = () => {
  const { token, user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchAppointments = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data: Appointment[] = await res.json();
        setAppointments(data.sort((a, b) => 
          new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
        ));
      }
    } catch (err) {
      console.error('Error fetching admin appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  const updateStatus = async (id: string, status: string) => {
    setIsUpdating(id);
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
        if (selectedAppointment && selectedAppointment.id === id) {
          setSelectedAppointment(prev => prev ? { ...prev, status: status as any } : null);
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesStatus = statusFilter === 'all' ? true : a.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (a.doctorName?.toLowerCase().includes(term)) ||
      (a.patientEmail?.toLowerCase().includes(term)) ||
      (a.patientPhone?.toLowerCase().includes(term)) ||
      (a.specialty?.toLowerCase().includes(term)) ||
      (a.date?.toLowerCase().includes(term)) ||
      (a.notes?.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold border border-emerald-200 uppercase tracking-tighter"><CheckCircle2 className="h-3 w-3" /> Confirmed</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded text-[10px] font-bold border border-red-200 uppercase tracking-tighter"><XCircle className="h-3 w-3" /> Cancelled</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-200 uppercase tracking-tighter"><ShieldCheck className="h-3 w-3" /> Completed</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded text-[10px] font-bold border border-amber-200 uppercase tracking-tighter"><Clock className="h-3 w-3" /> Pending Review</span>;
    }
  };

  if (isLoading && token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <AdminLoginGate onLoginSuccess={() => fetchAppointments()} />;
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* System Status Header - Traditional PHP/SQL System Style */}
      <div className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest border-b border-slate-700">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-emerald-400" /> System: Online</span>
          <span className="flex items-center gap-1.5"><FileText className="h-3 w-3 text-blue-400" /> Mode: Data Management</span>
          <span className="hidden sm:inline text-slate-500">Node: ASIA-SOUTH-1</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 font-bold tracking-tighter">ADMIN_PORTAL_v2.0</span>
        </div>
      </div>

      <div className="py-10">
        <div className="container mx-auto px-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <Link 
                to="/admin" 
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors mb-4 uppercase tracking-widest"
              >
                <ArrowLeft className="h-3 w-3" /> Back to Dashboard
              </Link>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Appointment Database</h1>
              <p className="text-slate-500 text-sm font-medium">Full records of all patient-doctor interactions and booking statuses</p>
            </div>

            <div className="flex items-center gap-3.5">
              <button
                onClick={fetchAppointments}
                disabled={isLoading}
                className="px-5 py-3 bg-white border border-slate-200 rounded text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin text-blue-600")} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-3 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
              >
                <Printer className="h-4 w-4" />
                <span>Print Records</span>
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-6 sm:p-7 rounded border border-slate-200 shadow-sm mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-5 items-stretch md:items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search database..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-800"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
                {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={cn(
                      "px-4 py-2 rounded text-[10px] font-black transition-all border uppercase tracking-widest",
                      statusFilter === tab 
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                        : "bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200"
                    )}
                  >
                    {tab}
                    {tab === 'all' && ` (${appointments.length})`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-16 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-500 font-medium uppercase text-xs tracking-widest">Querying database...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-16 text-center">
                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800 mb-1 uppercase tracking-tight">No records found</h3>
                <p className="text-slate-500 text-sm mb-4">Adjust your system filters to refine the results.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Patient / Client</th>
                      <th className="px-6 py-4">Specialist</th>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Status Code</th>
                      <th className="px-6 py-4 text-right">Execution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-slate-900 text-sm truncate max-w-[200px] uppercase">
                              {appt.patientEmail || 'SYS_USER'}
                            </span>
                            <span className="text-[9px] font-mono font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit">
                              REG_ID: {appt.patientRegId || 'NONE'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="font-bold text-slate-800 block uppercase tracking-tight">{appt.doctorName}</span>
                          <span className="text-[10px] text-blue-600 font-black uppercase tracking-tighter">{appt.specialty}</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-600">
                          {appt.date} <br/> {appt.time}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(appt.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedAppointment(appt)}
                            className="px-3 py-1.5 bg-slate-800 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white w-full max-w-lg border border-slate-300 shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Record_Viewer_v2.0</span>
                <button onClick={() => setSelectedAppointment(null)} className="p-1 hover:bg-slate-200 rounded"><X className="h-4 w-4" /></button>
              </div>

              <div className="p-8 space-y-6">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded font-mono text-xs">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-400">REF_ID:</span>
                    <span className="font-bold">{selectedAppointment.patientRegId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">STATUS:</span>
                    <span className="font-bold uppercase text-blue-600">{selectedAppointment.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Specialist</span>
                    <span className="text-sm font-bold text-slate-900 uppercase">{selectedAppointment.doctorName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Schedule</span>
                    <span className="text-sm font-bold text-slate-900 uppercase">{selectedAppointment.date} @ {selectedAppointment.time}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase mb-2 block">System Notes</span>
                  <div className="text-xs text-slate-600 bg-slate-50 p-4 border border-slate-100 min-h-[60px] uppercase font-medium">
                    {selectedAppointment.notes || 'EMPTY_RECORD'}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex gap-3">
                  <button onClick={() => window.print()} className="flex-1 py-3 bg-white border border-slate-200 text-xs font-black uppercase tracking-widest hover:bg-slate-50">Print_Ticket</button>
                  {selectedAppointment.status === 'pending' && (
                    <button 
                      onClick={() => { updateStatus(selectedAppointment.id, 'confirmed'); setSelectedAppointment(null); }}
                      className="flex-1 py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700"
                    >
                      Verify_Booking
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

export default AdminAppointments;
