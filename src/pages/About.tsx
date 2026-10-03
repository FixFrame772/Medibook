import React from 'react';
import { Users, Shield, Heart, Award, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const About = () => {
  return (
    <div className="flex flex-col">
      {/* Vision Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-4 inline-block">Our Story</span>
          <h1 className="text-5xl font-bold text-slate-900 mb-8 leading-tight">
            We're on a Mission to Make <span className="text-blue-600">Healthcare Accessible</span> to Everyone
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed mb-12">
            Founded in 2026, MediBook was born out of a simple idea: that finding the right doctor shouldn't be a struggle. We've built a platform that connects patients with world-class medical professionals seamlessly.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-100 pt-12">
            <div>
              <span className="block text-3xl font-bold text-slate-900">2026</span>
              <span className="text-sm text-slate-500">Established</span>
            </div>
            <div>
              <span className="block text-3xl font-bold text-slate-900">500+</span>
              <span className="text-sm text-slate-500">Doctors</span>
            </div>
            <div>
              <span className="block text-3xl font-bold text-slate-900">10k+</span>
              <span className="text-sm text-slate-500">Patients</span>
            </div>
            <div>
              <span className="block text-3xl font-bold text-slate-900">4.9/5</span>
              <span className="text-sm text-slate-500">Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-slate-500">The principles that guide everything we do.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Shield className="h-8 w-8 text-blue-600" />, 
                title: 'Patient Trust', 
                desc: 'Your health data is protected with the highest security standards. Trust is the foundation of our platform.' 
              },
              { 
                icon: <Award className="h-8 w-8 text-emerald-600" />, 
                title: 'Quality Care', 
                desc: 'We only partner with board-certified professionals who are leaders in their respective fields.' 
              },
              { 
                icon: <Heart className="h-8 w-8 text-purple-600" />, 
                title: 'Accessibility', 
                desc: 'We believe everyone deserves access to top-tier healthcare regardless of location or background.' 
              }
            ].map((value, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{value.title}</h3>
                <p className="text-slate-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-slate-900 leading-tight">Why Patients Choose <span className="text-blue-600">MediBook</span></h2>
              <div className="space-y-6">
                {[
                  'Instant booking with real-time availability',
                  'Verified board-certified medical specialists',
                  'Secure digital medical appointment slips',
                  'Patient-centric platform design',
                  '24/7 dedicated support team'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="/src/assets/images/hero_healthcare_1791003789329.jpg" 
                  alt="Our Team" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
