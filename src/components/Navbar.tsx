import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { LogOut, User as UserIcon, Menu, X, Calendar, Search } from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Hide Navbar completely on admin routes as requested
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Find Doctors', path: '/doctors' },
    { name: 'About Us', path: '/about' },
    ...(user?.role === 'patient' ? [{ name: 'My Bookings', path: '/dashboard' }] : []),
    ...(user?.role === 'admin' ? [
      { name: 'Admin Overview', path: '/admin' },
      { name: 'Appointments', path: '/admin/appointments' }
    ] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Left Side: Brand Logo + Nav Links strictly grouped with explicit separation */}
        <div className="flex items-center gap-8 lg:gap-10 min-w-0">
          {/* Zone 1: Brand */}
          <Link to="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-blue-600 shrink-0">
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              M
            </span>
            <span>MediBook</span>
          </Link>

          {/* Zone 2: Nav Links - strictly 1 line, never wrapped */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-8 text-sm font-semibold text-slate-600 shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "whitespace-nowrap py-1 transition-colors hover:text-blue-600 shrink-0 inline-block",
                  location.pathname === link.path 
                    ? "text-blue-600 font-bold border-b-2 border-blue-600" 
                    : "text-slate-600"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {user ? (
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors whitespace-nowrap"
              >
                <UserIcon className="h-3.5 w-3.5 text-blue-600" />
                <span className="max-w-[120px] truncate">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 inset-x-0 bg-white border-b border-slate-200 p-6 shadow-xl"
          >
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-lg font-medium py-2",
                    location.pathname === link.path ? "text-blue-600" : "text-slate-600"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {!user && (
                <Link
                  to="/login"
                  className="mt-4 px-5 py-3 text-center text-sm font-medium text-white bg-blue-600 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
