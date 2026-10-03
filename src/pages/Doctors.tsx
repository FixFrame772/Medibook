import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Doctor, Specialty } from '../types.ts';
import DoctorCard from '../components/DoctorCard.tsx';
import { supabase } from '../lib/supabase.ts';
import { normalizeDoctor } from '../lib/normalizers.ts';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '../lib/utils.ts';

const Doctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const currentSpecialty = searchParams.get('specialty') || '';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch specialties
        const specsRes = await fetch('/api/specialties');
        const specsData = await specsRes.json();
        setSpecialties(specsData);

        // 2. Fetch doctors from local API (has all specialties)
        const query = currentSpecialty ? `?specialty=${currentSpecialty}` : '';
        const docsRes = await fetch(`/api/doctors${query}`);
        const localDocs: Doctor[] = await docsRes.json();

        // 3. Also try Supabase for doctors
        let sbDocs: any[] | null = null;
        try {
          let queryBuilder = supabase.from('doctors').select('*');
          if (currentSpecialty) {
            queryBuilder = queryBuilder.eq('specialty', currentSpecialty);
          }
          const { data } = await queryBuilder;
          sbDocs = data;
        } catch (sbErr) {
          console.warn('Supabase doctors query notice:', sbErr);
        }

        if (sbDocs && sbDocs.length > 0) {
          const normalizedSbDocs = sbDocs.map(normalizeDoctor);
          // Merge: use Supabase doctor where name matches, otherwise keep local doctor
          const merged = [...normalizedSbDocs];
          for (const ld of localDocs) {
            if (!merged.some(m => m.name.toLowerCase() === ld.name.toLowerCase())) {
              merged.push(ld);
            }
          }
          setDoctors(merged);
        } else {
          setDoctors(localDocs.map(normalizeDoctor));
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentSpecialty]);

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSpecialtyChange = (name: string) => {
    if (currentSpecialty === name) {
      searchParams.delete('specialty');
    } else {
      searchParams.set('specialty', name);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Find Your Specialist</h1>
          <p className="text-slate-500">Browse through our network of top-rated healthcare professionals</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Filters
                </h2>
                {currentSpecialty && (
                  <button 
                    onClick={() => {
                      searchParams.delete('specialty');
                      setSearchParams(searchParams);
                    }}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Specialty</h3>
                <div className="space-y-2.5">
                  {specialties.map((spec) => (
                    <button
                      key={spec.id}
                      onClick={() => handleSpecialtyChange(spec.name)}
                      className={cn(
                        "w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border flex items-center justify-between",
                        currentSpecialty === spec.name 
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20" 
                          : "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100 hover:border-slate-200"
                      )}
                    >
                      <span>{spec.name}</span>
                      {currentSpecialty === spec.name && <span className="text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-grow">
            {/* Search Bar */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search doctors by name or specialty..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-[400px] bg-slate-100 animate-pulse rounded-2xl"></div>
                ))}
              </div>
            ) : filteredDoctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doc) => (
                  <DoctorCard key={doc.id} doctor={doc} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl text-center border border-slate-100">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No doctors found</h3>
                <p className="text-slate-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    searchParams.delete('specialty');
                    setSearchParams(searchParams);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Doctors;
