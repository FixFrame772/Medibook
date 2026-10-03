import React from 'react';
import { Shield, Lock, Eye, FileText, Bell } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
              <p className="text-slate-500">Last Updated: October 2026</p>
            </div>

            <div className="prose prose-slate max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-blue-600" /> Information We Collect
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  At MediBook, we take your privacy seriously. We collect information that you provide directly to us when you create an account, book an appointment, or contact us for support. This may include your name, email address, phone number, and medical history shared for appointments.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" /> How We Use Your Information
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  We use the information we collect to provide, maintain, and improve our services, including facilitating appointment bookings between you and healthcare providers. We also use this data to send you technical notices, updates, and security alerts.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" /> Data Security
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  We implement a variety of security measures to maintain the safety of your personal information. Your data is stored behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems and are required to keep the information confidential.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" /> Changes to This Policy
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this policy.
                </p>
              </section>

              <section className="pt-8 border-t border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Contact Us</h2>
                <p className="text-slate-600 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at privacy@medibook.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
