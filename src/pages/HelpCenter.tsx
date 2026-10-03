import React from 'react';
import { Search, HelpCircle, BookOpen, MessageCircle, ArrowRight } from 'lucide-react';

const HelpCenter = () => {
  const faqs = [
    { 
      q: 'How do I book an appointment?', 
      a: 'To book an appointment, search for a doctor by specialty or name, select their profile, choose a date and time slot, and confirm your details.' 
    },
    { 
      q: 'Can I cancel my appointment?', 
      a: 'Yes, you can cancel your appointment from your dashboard up to 24 hours before the scheduled time.' 
    },
    { 
      q: 'Are the doctors verified?', 
      a: 'All doctors on MediBook undergo a rigorous verification process to ensure they are board-certified and highly qualified.' 
    },
    { 
      q: 'How do I contact support?', 
      a: 'You can reach our support team through the Contact Us page or via live chat available on your dashboard.' 
    }
  ];

  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Help Center</h1>
            <p className="text-slate-500 text-lg">Everything you need to know about using MediBook.</p>
          </div>

          <div className="relative mb-12">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for help articles..."
              className="w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-3xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-200 transition-all group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">User Guide</h3>
              <p className="text-slate-500 mb-4">New to MediBook? Learn how to get started with our platform.</p>
              <button className="text-blue-600 font-bold flex items-center gap-2">
                Read Guide <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-200 transition-all group">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Direct Support</h3>
              <p className="text-slate-500 mb-4">Can't find what you need? Talk to our support specialists.</p>
              <button className="text-emerald-600 font-bold flex items-center gap-2">
                Get Help <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-blue-600" /> Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <div key={i} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                  <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-slate-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
