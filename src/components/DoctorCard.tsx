import React from 'react';
import { Doctor } from '../types.ts';
import { Star, MapPin, Clock, Calendar, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { formatCurrency, cn } from '../lib/utils.ts';

interface DoctorCardProps {
  doctor: Doctor;
  className?: string;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, className }) => {
  const { user, toggleFavorite } = useAuth();
  const isFavorite = user?.favoriteDoctorIds?.includes(doctor.id);

  return (
    <div className={cn("bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col", className)}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={doctor.photoUrl} 
          alt={doctor.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{doctor.rating}</span>
          </div>
          {user && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(doctor.id);
              }}
              className={cn(
                "w-8 h-8 rounded-lg backdrop-blur-sm flex items-center justify-center transition-all shadow-sm",
                isFavorite ? "bg-red-500 text-white" : "bg-white/90 text-slate-400 hover:text-red-500"
              )}
            >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="mb-2">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{doctor.specialty}</span>
          <h3 className="text-lg font-bold text-slate-900 mt-1">{doctor.name}</h3>
        </div>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{doctor.experience} years experience</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{doctor.availability.slice(0, 2).join(', ')}{doctor.availability.length > 2 ? '...' : ''}</span>
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block uppercase">Consultation Fee</span>
            <span className="text-lg font-bold text-slate-900">{formatCurrency(doctor.fees)}</span>
          </div>
          <Link 
            to={`/doctors/${doctor.id}`}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-600 hover:text-white transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
