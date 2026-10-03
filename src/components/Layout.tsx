import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar.tsx';
import SupportChat from './SupportChat.tsx';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <SupportChat />
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="text-xl font-bold text-blue-600 mb-4 inline-block">MediBook</Link>
              <p className="text-slate-500 max-w-sm mb-6">
                Connecting you with world-class healthcare professionals. 
                Experience a seamless booking process and personalized care.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/doctors" className="hover:text-blue-600">Find Doctors</Link></li>
                <li><Link to="/about" className="hover:text-blue-600">About Us</Link></li>
                <li><Link to="/#how-it-works" className="hover:text-blue-600">How it works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/help" className="hover:text-blue-600">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-blue-600">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} MediBook. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <span>Twitter</span>
              <span>Facebook</span>
              <span>LinkedIn</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
