import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  KeyRound, 
  ArrowLeft,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { BouncingDots } from '../components/BouncingDots.tsx';
import { FourLinesAnimation } from '../components/FourLinesAnimation.tsx';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 4-Digit OTP states
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [devOtp, setDevOtp] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState<number>(30);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/";

  // Resend timer countdown
  useEffect(() => {
    let timer: any;
    if (step === 'otp' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  // Handle Form Submit (Sign In or Send Sign Up OTP)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    if (isRegister) {
      // Sign Up Flow: Send 4-digit OTP to email
      try {
        const res = await fetch('/api/auth/send-signup-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();

        if (res.ok) {
          if (data.devOtp) setDevOtp(data.devOtp);
          setSuccessMsg(data.message || `4-digit OTP sent to ${email}`);
          setStep('otp');
          setResendCooldown(30);
          setOtpDigits(['', '', '', '']);
          setTimeout(() => {
            otpInputRefs[0].current?.focus();
          }, 200);
        } else {
          setError(data.error || 'Failed to send OTP code');
        }
      } catch (err) {
        setError('Server error. Please check your internet connection.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Standard Sign In Flow
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
          login(data.token, data.user);
          navigate(from, { replace: true });
        } else {
          setError(data.error || 'Invalid credentials');
        }
      } catch (err) {
        setError('Failed to connect to server');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle individual OTP input changes
  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned && value !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned.slice(-1); // Take last character entered
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (cleaned && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }

    // Auto-submit if all 4 digits are filled
    if (newDigits.every(d => d !== '') && index === 3) {
      handleVerifyOtp(newDigits.join(''));
    }
  };

  // Handle backspace navigation between digit boxes
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  // Handle paste for full 4-digit code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;

    const newDigits = ['', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);

    if (pasted.length === 4) {
      otpInputRefs[3].current?.focus();
      handleVerifyOtp(pasted);
    } else {
      otpInputRefs[Math.min(pasted.length, 3)].current?.focus();
    }
  };

  // Verify OTP with 4 lines animation and redirect to dashboard
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length !== 4) {
      setError('Please enter all 4 digits of your verification code.');
      return;
    }

    setError('');
    setIsVerifying(true);

    try {
      const res = await fetch('/api/auth/verify-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code })
      });
      const data = await res.json();

      if (res.ok) {
        setIsRedirecting(true);
        login(data.token, data.user);
        // Show 4 lines animation then redirect to Home page
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1200);
      } else {
        setError(data.error || 'Incorrect verification code. Please check and try again.');
        setIsVerifying(false);
      }
    } catch (err) {
      setError('Connection error during verification. Please try again.');
      setIsVerifying(false);
    }
  };

  // Resend code
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      const res = await fetch('/api/auth/send-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.devOtp) setDevOtp(data.devOtp);
        setSuccessMsg(`New 4-digit code sent to ${email}`);
        setResendCooldown(30);
      } else {
        setError(data.error || 'Failed to resend code');
      }
    } catch {
      setError('Failed to resend verification code');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 py-12 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="p-8">

          {/* STEP 1: LOGIN / SIGNUP CREDENTIALS FORM */}
          {step === 'form' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  {isRegister ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-slate-500 text-sm">
                  {isRegister 
                    ? 'Join MediBook to start booking your appointments' 
                    : 'Sign in to manage your appointments and health'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-2">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {isRegister && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        type="text" 
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium text-slate-900"
                        placeholder="e.g. Kavita Verma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium text-slate-900"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium text-slate-900"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit button with 4 dots loading animation */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-3 text-base disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <BouncingDots className="text-white" size="md" />
                      <span>{isRegister ? 'Sending 4-Digit OTP...' : 'Signing In...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isRegister ? 'Create Account & Get OTP' : 'Sign In'}</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center pt-2">
                <p className="text-slate-500 text-sm">
                  {isRegister ? 'Already have an account?' : "Don't have an account yet?"}
                  <button 
                    onClick={() => {
                      setIsRegister(!isRegister);
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="ml-2 font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {isRegister ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: 4-DIGIT OTP VERIFICATION SCREEN */}
          {step === 'otp' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setStep('form'); setError(''); }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Edit Details
                </button>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  Step 2 of 2
                </span>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <KeyRound className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Enter Verification Code</h2>
                <p className="text-slate-500 text-xs mt-1">
                  We've sent a 4-digit code to <span className="font-bold text-slate-800">{email}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Please check your inbox to view your code
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 text-center">
                  {error}
                </div>
              )}

              {/* 4 Digit Input Boxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-center mb-3">
                  4-Digit OTP Code
                </label>
                <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-[280px] mx-auto" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={otpInputRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      autoFocus={idx === 0}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-full h-14 sm:h-16 text-center text-2xl sm:text-3xl font-extrabold font-mono bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-slate-900"
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button with 4-Lines Animation */}
              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={isVerifying || isRedirecting || otpDigits.some(d => !d)}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-3 text-base disabled:opacity-50"
              >
                {isRedirecting ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-300 animate-pulse" />
                    <span>Verified! Redirecting to Home...</span>
                  </>
                ) : isVerifying ? (
                  <>
                    <FourLinesAnimation className="text-white" size="md" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    <span>Verify & Go to Home</span>
                  </>
                )}
              </button>

              {/* Resend Code Option */}
              <div className="text-center pt-2">
                {resendCooldown > 0 ? (
                  <p className="text-xs text-slate-400">
                    Resend code in <span className="font-bold text-slate-600">{resendCooldown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Resend 4-Digit Code
                  </button>
                )}
              </div>
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
};

export default Login;
