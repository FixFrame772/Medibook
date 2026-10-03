import React from 'react';
import { Users, Shield, Heart, Award, CheckCircle2, Activity, Database, Lock } from 'lucide-react';

const About = () => {
  return (
    <div className="flex flex-col bg-slate-50">
      {/* Vision Section - Formal Header */}
      <section className="py-24 bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <div className="inline-block px-3 py-1 mb-6 text-[10px] font-bold tracking-widest text-blue-700 uppercase bg-blue-100 border border-blue-200 rounded">
            Organizational Overview
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-8 leading-tight uppercase tracking-tight">
            Advancing Healthcare <span className="text-blue-600">Through Technology</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-12 font-medium">
            Established in 2026, MediBook serves as a centralized node for healthcare accessibility. 
            Our system architecture is designed to bridge the gap between world-class medical 
            specialists and patients requiring immediate professional care.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-100 pt-12">
            <div>
              <span className="block text-3xl font-black text-slate-900">2026</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. Year</span>
            </div>
            <div>
              <span className="block text-3xl font-black text-slate-900">500+</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Staff</span>
            </div>
            <div>
              <span className="block text-3xl font-black text-slate-900">10k+</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Clients</span>
            </div>
            <div>
              <span className="block text-3xl font-black text-slate-900">100%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - Traditional Grid */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">System Core Values</h2>
            <p className="text-slate-500 font-mono text-sm">Operational Principles & Standards</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Lock className="h-6 w-6 text-blue-600" />, 
                title: 'DATA PRIVACY', 
                desc: 'All patient records are encrypted via AES-256 standards, ensuring absolute confidentiality and trust.' 
              },
              { 
                icon: <Database className="h-6 w-6 text-emerald-600" />, 
                title: 'SYSTEM INTEGRITY', 
                desc: 'We partner exclusively with board-certified professionals verified through a rigorous multi-stage audit.' 
              },
              { 
                icon: <Activity className="h-6 w-6 text-blue-600" />, 
                title: 'OPERATIONAL EXCELLENCE', 
                desc: 'Optimized scheduling algorithms ensure minimal latency between appointment request and confirmation.' 
              }
            ].map((value, i) => (
              <div key={i} className="bg-white p-10 border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded flex items-center justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-widest">{value.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium uppercase tracking-tight">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
