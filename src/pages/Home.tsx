import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Doctor, Specialty } from '../types.ts';
import DoctorCard from '../components/DoctorCard.tsx';
import { normalizeDoctor } from '../lib/normalizers.ts';
import { ArrowRight, Shield, Clock, Users, Search, Heart, Baby, Sun, Brain, Stethoscope, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

const specialtyIcons: Record<string, React.ReactNode> = {
  'Heart': <Heart className="h-6 w-6" />,
  'Sun': <Sun className="h-6 w-6" />,
  'Baby': <Baby className="h-6 w-6" />,
  'Brain': <Brain className="h-6 w-6" />,
  'Stethoscope': <Stethoscope className="h-6 w-6" />
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
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-white">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full">
                Your Health, Our Priority
              </span>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Find and Book the <span className="text-blue-600">Best Doctors</span> Near You
              </h1>
              <p className="text-xl text-slate-500 mb-10 max-w-lg leading-relaxed">
                Connect with professional healthcare providers across all specialties. 
                Experience a hassle-free appointment booking system.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/doctors" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200">
                  Book an Appointment
                </Link>
                <a href="#how-it-works" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all">
                  How it Works
                </a>
              </div>
              <div className="mt-12 flex items-center gap-8 border-t border-slate-100 pt-8">
                <div>
                  <span className="block text-2xl font-bold text-slate-900">500+</span>
                  <span className="text-sm text-slate-500">Expert Doctors</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-slate-900">10k+</span>
                  <span className="text-sm text-slate-500">Happy Patients</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-slate-900">4.9/5</span>
                  <span className="text-sm text-slate-500">Avg Rating</span>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="/assets/images/hero_healthcare_1791003789329.jpg" 
                  alt="Modern Healthcare Facility"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 max-w-[240px]">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <span className="block font-bold text-slate-900">Verified</span>
                  <span className="text-xs text-slate-500">All doctors are certified professionals</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Search by Specialty</h2>
            <p className="text-slate-500">Find the right specialist for your healthcare needs</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {specialties.map((spec) => (
              <Link 
                key={spec.id}
                to={`/doctors?specialty=${spec.name}`}
                className="bg-white p-8 rounded-2xl border border-slate-100 text-center hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 mb-4 mx-auto group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  {specialtyIcons[spec.iconName] || <Stethoscope className="h-6 w-6" />}
                </div>
                <h3 className="font-bold text-slate-900">{spec.name}</h3>
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

      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-blue-600 text-white overflow-hidden relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it Works</h2>
            <p className="text-blue-100 opacity-80">Book your appointment in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Search />, title: 'Find your doctor', desc: 'Search from our extensive list of verified specialists by specialty or location.' },
              { icon: <Calendar />, title: 'Choose a slot', desc: 'Pick a date and time that works best for your schedule from the doctor\'s availability.' },
              { icon: <Shield />, title: 'Get Confirmed', desc: 'Receive an instant confirmation of your booking and a reminder before your appointment.' }
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 mx-auto border border-white/20">
                  {React.cloneElement(step.icon as React.ReactElement<any>, { className: 'h-8 w-8' })}
                </div>
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-blue-100 opacity-80 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
      </section>
    </div>
  );
};

export default Home;
