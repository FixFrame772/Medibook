import React, { useState, useRef, useEffect } from 'react';
import { X, Send, User, Headset, Loader2, Minus, Maximize2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils.ts';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Welcome to MediBook Support. I am MediBook, your system representative. How can we help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener('open-support-chat', handleOpenChat);
    return () => window.removeEventListener('open-support-chat', handleOpenChat);
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'model', text: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: data.error || 'Our support system is currently busy. Please try again.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: 'Network error. Please check your connection.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: -10 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: 1,
                rotateX: 0,
                height: isMinimized ? '45px' : '450px'
              }}
              exit={{ opacity: 0, y: 50, scale: 0.9, rotateX: 10 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25 
              }}
              className={cn(
                "bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-300 overflow-hidden flex flex-col transition-all duration-300",
                "w-[320px] sm:w-[360px] rounded-t-xl"
              )}
            >
              {/* Header - Traditional PHP style (Solid Bar) */}
              <div className="bg-slate-800 p-3.5 flex items-center justify-between text-white shrink-0 cursor-pointer" onClick={() => isMinimized && setIsMinimized(false)}>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Headset className="h-4 w-4 text-blue-400" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border border-slate-800 animate-pulse"></span>
                  </div>
                  <span className="font-black text-[10px] uppercase tracking-[0.2em]">MediBook Core Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Chat Body */}
              {!isMinimized && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-white scrollbar-hide">
                    {messages.map((m, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20, y: 10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={cn(
                          "flex flex-col gap-1.5",
                          m.role === 'user' ? "items-end" : "items-start"
                        )}
                      >
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                          {m.role === 'user' ? 'CLIENT_SESSION' : 'MEDIBOOK'}
                        </span>
                        <div className={cn(
                          "p-3.5 text-sm border shadow-sm transition-all",
                          m.role === 'user' 
                            ? "bg-slate-900 border-slate-800 text-white rounded-2xl rounded-tr-none" 
                            : "bg-blue-50 border-blue-100 text-slate-800 rounded-2xl rounded-tl-none"
                        )}>
                          {m.text}
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="flex flex-col items-start gap-1.5"
                      >
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">MediBook</span>
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl rounded-tl-none flex gap-1">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area - More standard form style */}
                  <form 
                    onSubmit={handleSendMessage}
                    className="p-4 border-t border-slate-200 bg-slate-50 shrink-0"
                  >
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400 font-medium"
                      />
                      <button 
                        type="submit"
                        disabled={!message.trim() || isLoading}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-700 disabled:bg-slate-300 transition-all flex items-center gap-2 active:scale-95"
                      >
                        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button - Traditional "Online" tab style */}
      <button 
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className={cn(
          "px-4 py-2 bg-blue-600 text-white shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-all rounded-t-lg font-bold text-xs uppercase tracking-wider",
          isOpen && "hidden"
        )}
      >
        <MessageCircle className="h-4 w-4" />
        Live Support Online
      </button>
    </div>
  );
};

export default SupportChat;
