import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiRobot2Fill, RiCloseLine, RiSendPlane2Fill, RiMicFill, RiMicOffFill } from 'react-icons/ri';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getBackendBase } from '../../services/download';
import { voiceControl } from "../../services/voiceControl";
import { hapticImpact } from "../../shared/utils";

const PERSONAS = {
  BUTLER: { name: "Genius", description: "Polite & Precise", tone: "Greetings. I am StreamLux Genius. ✨ How can I elevate your journey today?" },
  CRITIC: { name: "The Critic", description: "Analytical & Sharp", tone: "Looking for something actually worth watching? I've analyzed the archives for you." },
  FAN: { name: "The Fan", description: "Excited & Knowledgeable", tone: "Oh! You're gonna LOVE what I've found for you today! What are we watching?" }
};

const GeniusAI: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [persona, setPersona] = useState(PERSONAS.BUTLER);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'bot' | 'system', text: string}[]>([]);
  const [history, setHistory] = useState<{role: string; content: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load Persona or Default
  useEffect(() => {
    const savedPersona = localStorage.getItem("genius_persona");
    if (savedPersona && PERSONAS[savedPersona as keyof typeof PERSONAS]) {
      setPersona(PERSONAS[savedPersona as keyof typeof PERSONAS]);
    }
  }, []);

  // Initialize Greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'bot', text: persona.tone }]);
    }
  }, [persona, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Command Registry (Merged from Vision)
  useEffect(() => {
    voiceControl.registerCommands([
      {
        command: /go home|navigate to home/i,
        callback: () => {
          navigate("/");
          setIsOpen(false);
          toast.success("Navigating Home", { icon: "🏠" });
        },
        description: "Go to homepage"
      },
      {
        command: /open settings|go to settings/i,
        callback: () => {
          navigate("/settings");
          setIsOpen(false);
          toast.success("Opening Settings", { icon: "⚙️" });
        },
        description: "Open app settings"
      },
      {
        command: /show watchlist|my watchlist/i,
        callback: () => {
          navigate("/watchlist");
          setIsOpen(false);
          toast.success("Opening Watchlist", { icon: "📂" });
        },
        description: "Open your watchlist"
      },
      {
        command: /search for (.+)/i,
        callback: (match) => {
          const query = match[1];
          navigate(`/search?query=${encodeURIComponent(query)}`);
          setIsOpen(false);
          toast.success(`Searching for ${query}`, { icon: "🔍" });
        },
        description: "Search for content"
      },
      {
        command: /.+/, 
        callback: (match) => {
          if (isOpen) {
            const transcript = match[0];
            setInput(transcript);
            setTimeout(() => handleSend(transcript), 500);
          }
        },
        description: "Voice chat with Genius"
      }
    ]);
  }, [navigate, isOpen]);

  const toggleListening = () => {
    if (isListening) {
      voiceControl.stop();
      setIsListening(false);
    } else {
      setInput("");
      voiceControl.start();
      setIsListening(true);
      hapticImpact();

      const checkInterval = setInterval(() => {
        if (!voiceControl.getIsListening()) {
          setIsListening(false);
          clearInterval(checkInterval);
        }
      }, 500);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const userMessage = textOverride || input;
    if (!userMessage.trim() || isTyping) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    // Build conversation history for multi-turn context
    const currentPersonaKey = Object.keys(PERSONAS).find(
      k => PERSONAS[k as keyof typeof PERSONAS].name === persona.name
    ) || 'BUTLER';

    const newHistory = [...history, { role: 'user', content: userMessage }];

    try {
      const response = await axios.post(
        `${getBackendBase()}/api/proxy/genius`,
        {
          prompt: userMessage,
          persona: currentPersonaKey,
          history: newHistory.slice(-10),
        }
      );

      const botReply = response.data.answer || "I didn't quite catch that. Could you rephrase?";
      setMessages(prev => [...prev, { role: 'bot', text: botReply }]);
      setHistory([...newHistory, { role: 'assistant', content: botReply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "I'm sorry, I'm currently having trouble connecting to my brain. Please try again soon!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const changePersona = (pKey: keyof typeof PERSONAS) => {
    setPersona(PERSONAS[pKey]);
    localStorage.setItem("genius_persona", pKey);
    setMessages([{ role: 'bot', text: PERSONAS[pKey].tone }]);
    setHistory([]); // Clear history on persona switch
    hapticImpact();
  };

  return (
    <div className="fixed bottom-24 right-6 z-[1000] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="w-[340px] h-[500px] bg-[#0A0A0A]/90 tw-glass rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col mb-4"
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-primary/20 to-transparent border-b border-white/5">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg rotate-3">
                    <RiRobot2Fill size={22} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm tracking-tight">{persona.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{persona.description}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition">
                  <RiCloseLine size={24} />
                </button>
              </div>

              {/* Persona Switcher */}
              <div className="flex gap-2">
                {Object.keys(PERSONAS).map((key) => (
                  <button
                    key={key}
                    onClick={() => changePersona(key as keyof typeof PERSONAS)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border ${persona.name === PERSONAS[key as keyof typeof PERSONAS].name 
                      ? 'bg-primary border-primary text-black' 
                      : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'}`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 custom-sidebar-scroll scrollbar-hide">
              {messages.map((m, i) => (
                <motion.div
                  initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-[12px] leading-relaxed shadow-sm ${
                    m.role === 'user' 
                    ? 'bg-primary text-black font-semibold rounded-tr-none' 
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

            {/* Input Area */}
            <div className="p-5 bg-white/5 border-t border-white/5">
              <div className="flex gap-3 items-center">
                <button
                  onClick={toggleListening}
                  className={`w-12 h-12 rounded-2xl transition-all flex items-center justify-center ${isListening 
                    ? 'bg-red-500 shadow-lg shadow-red-500/40 text-white' 
                    : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}
                >
                  {isListening ? <RiMicOffFill size={22} className="animate-pulse" /> : <RiMicFill size={22} />}
                </button>
                <div className="flex-grow relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={isListening ? "Listening..." : "Ask me anything..."}
                    className="w-full bg-dark/60 border border-white/10 rounded-2xl py-3.5 pl-5 pr-12 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition"
                  />
                  <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-black hover:bg-primary/80 transition disabled:opacity-0"
                  >
                    <RiSendPlane2Fill size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-[2rem] bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white shadow-[0_15px_45px_rgba(255,108,82,0.4)] border-2 border-white/20 relative group z-[10002]"
      >
        <div className="absolute inset-0 rounded-[2rem] bg-primary/20 animate-ping group-hover:hidden"></div>
        {isOpen ? <RiCloseLine size={32} /> : <RiRobot2Fill size={32} />}
      </motion.button>
    </div>
  );
};

export default GeniusAI;
