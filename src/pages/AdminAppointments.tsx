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
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200"><CheckCircle2 className="h-3.5 w-3.5" /> Confirmed</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200"><XCircle className="h-3.5 w-3.5" /> Cancelled</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200"><ShieldCheck className="h-3.5 w-3.5" /> Completed</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200"><Clock className="h-3.5 w-3.5" /> Pending Review</span>;
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
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6">
        
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Link 
              to="/admin" 
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Admin Overview
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Manage All Appointments</h1>
            <p className="text-slate-500 text-sm">Full dedicated portal to view, verify, and update patient bookings</p>
          </div>

          <div className="flex items-center gap-3.5">
            <button
              onClick={fetchAppointments}
              disabled={isLoading}
              className="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin text-blue-600")} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-3 bg-blue-600 text-white rounded-2xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md shadow-blue-500/10"
            >
              <Printer className="h-4 w-4" />
              <span>Print Records</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-5 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search patient, doctor, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
              {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={cn(
                    "px-4.5 py-2.5 rounded-2xl text-xs font-bold transition-all border",
                    statusFilter === tab 
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20" 
                      : "bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200"
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'all' && ` (${appointments.length})`}
                  {tab === 'pending' && ` (${appointments.filter(a => a.status === 'pending').length})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Appointments List / Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-500 font-medium">Loading appointment records...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-16 text-center">
              <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">No appointments found</h3>
              <p className="text-slate-500 text-sm mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria or filter tags.' 
                  : 'No appointments have been booked on the platform yet.'}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <button 
                  onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Doctor & Specialty</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Appointment Schedule</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Patient Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                            {appt.patientEmail ? appt.patientEmail.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div>
                            <span className="block font-bold text-slate-900 text-sm">
                              {appt.patientEmail || 'Patient'}
                            </span>
                            <div className="flex flex-col gap-0.5 mt-1">
                              <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md inline-block w-fit">
                                ID: {appt.patientRegId || 'N/A'}
                              </span>
                              {appt.patientPhone && (
                                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                  <Phone className="h-2.5 w-2.5" /> {appt.patientPhone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Doctor Details */}
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">{appt.doctorName}</span>
                          <span className="text-xs text-blue-600 font-semibold">{appt.specialty}</span>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <Calendar className="h-3.5 w-3.5 text-blue-500" />
                            <span>{formatDate(appt.date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>{appt.time}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(appt.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {appt.status === 'pending' && (
                            <button
                              onClick={() => updateStatus(appt.id, 'confirmed')}
                              disabled={isUpdating === appt.id}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                              title="Confirm Booking"
                            >
                              {isUpdating === appt.id ? (
                                <BouncingDots className="text-white" size="sm" />
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Confirm</span>
                                </>
                              )}
                            </button>
                          )}

                          {appt.status === 'confirmed' && (
                            <button
                              onClick={() => updateStatus(appt.id, 'completed')}
                              disabled={isUpdating === appt.id}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                              title="Mark Completed"
                            >
                              {isUpdating === appt.id ? (
                                <BouncingDots className="text-white" size="sm" />
                              ) : (
                                <>
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  <span>Complete</span>
                                </>
                              )}
                            </button>
                          )}

                          {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                            <button
                              onClick={() => updateStatus(appt.id, 'cancelled')}
                              disabled={isUpdating === appt.id}
                              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                              title="Cancel Booking"
                            >
                              {isUpdating === appt.id ? (
                                <BouncingDots className="text-red-600" size="sm" />
                              ) : (
                                <>
                                  <XCircle className="h-3.5 w-3.5" />
                                  <span>Cancel</span>
                                </>
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedAppointment(appt)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                            title="View Full Details"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                            <span className="hidden sm:inline">Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Appointment Detail Modal */}
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
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Booking Receipt</span>
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
                    {getStatusBadge(selectedAppointment.status)}
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

                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Patient Contact</span>
                  <div className="space-y-3 text-sm text-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                        <Mail className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-slate-600">{selectedAppointment.patientEmail || 'Not specified'}</span>
                    </div>
                    {selectedAppointment.patientPhone && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                          <Phone className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-slate-600">{selectedAppointment.patientPhone}</span>
                      </div>
                    )}
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

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {selectedAppointment.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(selectedAppointment.id, 'confirmed')}
                        className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10"
                      >
                        Confirm Booking
                      </button>
                    )}
                    {selectedAppointment.status === 'confirmed' && (
                      <button
                        onClick={() => updateStatus(selectedAppointment.id, 'completed')}
                        className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-blue-500/10"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
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
