import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Doctor } from '../types.ts';
import { cn } from '../lib/utils.ts';
import { motion, AnimatePresence } from 'motion/react';
import { BouncingDots } from './BouncingDots.tsx';

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDoctorAdded: (doctor: Doctor) => void;
  token: string | null;
}

const COMMON_DEGREES = ['MBBS', 'MD', 'MS', 'FACC', 'FAAD', 'Board Certified', 'PhD', 'FRCS', 'DNB'];
const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Neurology',
  'General Medicine',
  'Orthopedics',
  'Ophthalmology',
  'Dental Care',
  'Psychiatry',
  'ENT'
];

const PRESET_AVATARS = [
  '/src/assets/images/doctor_cardiology_1791003731426.jpg',
  '/src/assets/images/doctor_dermatology_1791003744157.jpg',
  '/src/assets/images/doctor_pediatrics_1791003754715.jpg',
  '/src/assets/images/doctor_neurology_1791003767614.jpg',
  '/src/assets/images/doctor_general_1791003778534.jpg'
];

export const AddDoctorModal: React.FC<AddDoctorModalProps> = ({
  isOpen,
  onClose,
  onDoctorAdded,
  token
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [degree, setDegree] = useState('');
  const [specialty, setSpecialty] = useState('Cardiology');
  const [experience, setExperience] = useState('8');
  const [fees, setFees] = useState('120');
  const [availability, setAvailability] = useState<string[]>(['Monday', 'Wednesday', 'Friday']);
  const [about, setAbout] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [imageFileName, setImageFileName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Handle local device picture upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit. Please choose a smaller picture.');
      return;
    }

    setError('');
    setImageFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleDay = (day: string) => {
    setAvailability(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const addDegreeBadge = (badge: string) => {
    const current = degree.split(',').map(s => s.trim()).filter(Boolean);
    if (!current.includes(badge)) {
      current.push(badge);
      setDegree(current.join(', '));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter doctor name.');
      return;
    }
    if (!degree.trim()) {
      setError('Please enter qualifications/degree (e.g. MBBS, MD).');
      return;
    }
    if (availability.length === 0) {
      setError('Please select at least one available day.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const formattedName = name.trim().startsWith('Dr.') ? name.trim() : `Dr. ${name.trim()}`;
    const qualificationsList = degree.split(',').map(d => d.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formattedName,
          specialty,
          photoUrl: photoUrl || PRESET_AVATARS[0],
          experience: Number(experience) || 5,
          qualifications: qualificationsList,
          fees: Number(fees) || 100,
          availability,
          about: about.trim() || `${formattedName} is a certified ${specialty} specialist with ${experience} years of clinical experience, holding ${qualificationsList.join(', ')}.`
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add doctor');
      }

      onDoctorAdded(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error adding doctor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Add New Doctor</h2>
            <p className="text-slate-500 text-sm mt-0.5">Enter doctor credentials and upload photo from device</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Picture Upload from Device */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <label className="block text-sm font-bold text-slate-800 mb-2">Doctor Profile Picture</label>
            <p className="text-xs text-slate-500 mb-4">Upload a high quality photo directly from your device (phone or computer)</p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Photo Preview */}
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-white border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 shadow-sm">
                {photoUrl ? (
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <Camera className="h-8 w-8 mx-auto mb-1 text-slate-300" />
                    <span className="text-[10px] font-semibold">No Image</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-grow space-y-3">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden" 
                />

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 shadow-md shadow-blue-500/10"
                  >
                    <Upload className="h-4 w-4" />
                    Upload from Device
                  </button>

                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoUrl('');
                        setImageFileName('');
                      }}
                      className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl text-xs font-bold transition-colors"
                    >
                      Clear Image
                    </button>
                  )}
                </div>

                {imageFileName ? (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-2 pt-1">
                    <Check className="h-4 w-4" /> Selected: {imageFileName}
                  </p>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
                    <span className="text-xs text-slate-500 font-medium">Or choose avatar:</span>
                    <div className="flex items-center gap-3">
                      {PRESET_AVATARS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPhotoUrl(av)}
                          className={cn(
                            "w-11 h-11 rounded-2xl overflow-hidden border-2 transition-all p-0.5 bg-white",
                            photoUrl === av 
                              ? "border-blue-600 scale-105 shadow-md ring-2 ring-blue-100" 
                              : "border-slate-200 opacity-75 hover:opacity-100 hover:border-slate-300"
                          )}
                        >
                          <img src={av} alt="Preset" className="w-full h-full object-cover rounded-xl" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Name & Specialty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Doctor Full Name *
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. Dr. Jane Mitchell"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Specialty *
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 text-sm"
              >
                {SPECIALTIES.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Degrees & Qualifications */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Degree & Qualifications *
              </label>
              <span className="text-xs text-slate-400">Comma separated (e.g. MBBS, MD, FACC)</span>
            </div>
            <input 
              type="text" 
              required
              placeholder="e.g. MBBS, MD - Cardiology, FACC"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 text-sm"
            />
            {/* Quick Degree Pills */}
            <div className="flex flex-wrap items-center gap-2.5 mt-3.5">
              <span className="text-xs text-slate-400 font-medium mr-1">Suggestions:</span>
              {COMMON_DEGREES.map((badge) => (
                <button
                  key={badge}
                  type="button"
                  onClick={() => addDegreeBadge(badge)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200/60 transition-all hover:scale-[1.03]"
                >
                  + {badge}
                </button>
              ))}
            </div>
          </div>

          {/* Experience & Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Experience (Years)
              </label>
              <input 
                type="number" 
                min="1"
                max="60"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Consultation Fee ($)
              </label>
              <input 
                type="number" 
                min="0"
                step="5"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 text-sm"
              />
            </div>
          </div>

          {/* Availability Days */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Available Days
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 sm:gap-3">
              {ALL_DAYS.map((day) => {
                const isSelected = availability.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "py-3 rounded-2xl text-xs font-bold transition-all text-center border",
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                    )}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* About / Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Doctor Bio / Description
            </label>
            <textarea 
              rows={3}
              placeholder="Provide a brief summary of the doctor's medical background, achievements, and patient philosophy..."
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 resize-none text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/10 flex items-center gap-3 text-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <BouncingDots className="text-white" size="sm" />
                  <span>Adding Doctor...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Add Doctor to MediBook</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
