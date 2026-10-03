import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Doctor, Specialty } from '../types.ts';
import DoctorCard from '../components/DoctorCard.tsx';
import { normalizeDoctor } from '../lib/normalizers.ts';
import { ArrowRight, Shield, Clock, Users, Search, Heart, Baby, Sun, Brain, Stethoscope, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

const specialtyIcons: Record<string, React.ReactNode> = {
  'Cardiology': <Heart className="h-5 w-5" />,
  'Dermatology': <Sun className="h-5 w-5" />,
  'Pediatrics': <Baby className="h-5 w-5" />,
  'Neurology': <Brain className="h-5 w-5" />,
  'Orthopedics': <Stethoscope className="h-5 w-5" />,
  'General': <Stethoscope className="h-5 w-5" />
};

const Home = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, specsRes] = await Promise.all([
          fetch('/api/doctors'),
          fetch('/api/specialties')
        ]);
        const [docsData, specsData] = await Promise.all([
          docsRes.json(),
          specsRes.json()
        ]);
        setDoctors(docsData.map(normalizeDoctor).slice(0, 4));
        setSpecialties(specsData);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section - System Portal Style */}
      <section className="relative py-24 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold tracking-widest text-blue-700 uppercase bg-blue-100 border border-blue-200 rounded">
                Official Healthcare Management System
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
                Online Doctor Appointment & <br/>
                <span className="text-blue-600">Patient Care Portal</span>
              </h1>
              <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed font-medium">
                Access a professional network of verified healthcare specialists. 
                Experience a secure, data-driven system for your medical needs.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/doctors" className="px-10 py-4 bg-blue-600 text-white rounded font-bold uppercase tracking-wide hover:bg-blue-700 transition-all shadow-md">
                  Search Specialists
                </Link>
                <Link to="/login" className="px-10 py-4 bg-white text-slate-700 border border-slate-300 rounded font-bold uppercase tracking-wide hover:bg-slate-50 transition-all">
                  Access Portal
                </Link>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="relative border-8 border-white shadow-2xl rounded-lg overflow-hidden bg-slate-200 aspect-[4/3]">
                <img 
                  src="/assets/images/hero_healthcare_1791003789329.jpg" 
                  alt="Medical Facility"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties - System Categories Style */}
      <section className="py-24 bg-white border-b border-slate-200">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4 mb-16 justify-center md:justify-start">
            <div className="h-px w-12 bg-blue-600"></div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">System Categories</h2>
            <div className="hidden md:block h-px flex-1 bg-slate-100"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {specialties.map((spec) => (
              <Link 
                key={spec.id}
                to={`/doctors?specialty=${spec.name}`}
                className="bg-slate-50 p-6 border border-slate-200 text-left hover:bg-white hover:border-blue-600 hover:shadow-xl transition-all group"
              >
                <div className="w-10 h-10 bg-white border border-slate-200 rounded flex items-center justify-center text-slate-400 mb-6 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                  {specialtyIcons[spec.name] || specialtyIcons['General']}
                </div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{spec.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">View Specialists</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Top Rated Doctors</h2>
              <p className="text-slate-500">The most experienced and highly rated specialists available for you</p>
            </div>
            <Link to="/doctors" className="flex items-center gap-2 text-blue-600 font-bold hover:underline">
              View All Doctors <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it Works - System Workflow Style */}
      <section id="how-it-works" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">System Workflow</h2>
              <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">Formal Booking Integration Protocol</p>
            </div>
            <div className="hidden md:block h-px flex-1 bg-slate-800 mx-10"></div>
            <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest border border-blue-500/30 px-4 py-2 rounded">
              Verified Pipeline
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Search />, title: '1. DATABASE QUERY', desc: 'Execute a comprehensive search through our verified specialist registry by clinical field or region.' },
              { icon: <Calendar />, title: '2. SLOT ALLOCATION', desc: 'Secure a validated timestamp within the system grid that aligns with the current specialist availability.' },
              { icon: <Shield />, title: '3. VERIFY & COMMIT', desc: 'System-wide validation of booking request with immediate generation of digital medical appointment credentials.' }
            ].map((step, idx) => (
              <div key={idx} className="bg-slate-800/40 border border-slate-800 p-8 rounded hover:bg-slate-800 transition-colors">
                <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center mb-8 text-white shadow-lg shadow-blue-900/40">
                  {React.cloneElement(step.icon as React.ReactElement<any>, { className: 'h-5 w-5' })}
                </div>
                <h3 className="text-sm font-black mb-4 uppercase tracking-widest text-white">{step.title}</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed font-bold uppercase tracking-tight">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
