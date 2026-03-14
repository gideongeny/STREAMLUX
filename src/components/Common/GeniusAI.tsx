import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiRobot2Fill, RiCloseLine, RiSendPlane2Fill } from 'react-icons/ri';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { getBackendBase } from '../../services/download';

const GeniusAI: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: "Hello! I'm StreamLux Genius. ✨ How can I help you discover your next favorite movie or match today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const response = await axios.post(`${getBackendBase()}/geniusProxy`, {
        prompt: userMessage,
        context: window.location.pathname
      });

      setMessages(prev => [...prev, { role: 'bot', text: response.data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "I'm sorry, I'm currently having trouble connecting to my brain. Please try again soon!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-[1000] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="w-[320px] h-[450px] bg-dark/40 tw-glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col mb-4"
          >
            {/* Header */}
            <div className="p-4 bg-primary/20 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                  <RiRobot2Fill size={18} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm tracking-tight">StreamLux Genius</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] text-gray-400 font-medium">Ready to serve</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition">
                <RiCloseLine size={24} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-sidebar-scroll">
              {messages.map((m, i) => (
                <motion.div
                  initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white/5 border-t border-white/5">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="w-full bg-dark/60 border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1.5 top-1.5 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/80 transition disabled:opacity-50"
                >
                  <RiSendPlane2Fill size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white shadow-[0_10px_30px_rgba(255,108,82,0.3)] border border-white/20 relative group"
      >
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping group-hover:hidden"></div>
        {isOpen ? <RiCloseLine size={28} /> : <RiRobot2Fill size={28} />}
      </motion.button>
    </div>
  );
};

export default GeniusAI;
