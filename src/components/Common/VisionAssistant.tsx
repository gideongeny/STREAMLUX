import { FC, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiSparkles } from "react-icons/hi";
import { IoMdSend, IoMdClose, IoMdCompass, IoMdMic, IoMdMicOff } from "react-icons/io";
import { hapticImpact } from "../../shared/utils";
import { useAppDispatch } from "../../store/hooks";
import { setSpotlightOpen } from "../../store/slice/uiSlice";
import { toast } from "react-toastify";
import { voiceControl } from "../../services/voiceControl";
import { useNavigate } from "react-router-dom";

// Vision AI 2.0: Knowledge Nodes & Personas
const QUICK_PROMPTS = [
    "Find me 🌋 Epic Masterpieces",
    "I want 🎭 Emotional Rollercoasters",
    "Show me 🌌 Cosmic Sci-Fi",
    "I'm feeling 🤣 Pure Comedy",
];

const PERSONAS = {
    BUTLER: { name: "Vision", description: "Polite & Precise", tone: "Greetings. I am Vision. How can I elevate your journey?" },
    CRITIC: { name: "The Critic", description: "Analytical & Sharp", tone: "Looking for something actually worth watching? I've analyzed the archives." },
    ENTHUSIAST: { name: "The Fan", description: "Excited & Knowledgeable", tone: "Oh! You're gonna LOVE what I've found for you today!" }
};

const VisionAssistant: FC = () => {
    const dispatch = useAppDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const navigate = useNavigate();
    const [input, setInput] = useState("");
    const [persona, setPersona] = useState(PERSONAS.BUTLER);
    const [messages, setMessages] = useState<any[]>([]);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // Initialize with persona and persistent storage
    useEffect(() => {
        const savedPersona = localStorage.getItem("vision_persona");
        if (savedPersona && PERSONAS[savedPersona as keyof typeof PERSONAS]) {
            setPersona(PERSONAS[savedPersona as keyof typeof PERSONAS]);
        }
    }, []);

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{ role: "ai", text: persona.tone }]);
        }
    }, [persona, messages.length]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Register GLOBAL App Commands via Vision Assistant
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
                    navigate(`/search?q=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                    toast.success(`Searching for ${query}`, { icon: "🔍" });
                },
                description: "Search for content"
            },
            {
                command: /.+/, // Catch-all for AI Chat when assistant is open
                callback: (match) => {
                    if (isOpen) {
                        const transcript = match[0];
                        setInput(transcript);
                        setTimeout(() => handleSend(transcript), 500);
                    }
                },
                description: "Voice chat with Vision"
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

            // Sync local state when voice engine stops
            const checkInterval = setInterval(() => {
                if (!voiceControl.getIsListening()) {
                    setIsListening(false);
                    clearInterval(checkInterval);
                }
            }, 500);
        }
    };

    const handleSend = (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim()) return;
        hapticImpact();
        setMessages(prev => [...prev, { role: "user", text: textToSend }]);
        setInput("");

        // Vision AI 2.0: Dynamic Response with Knowledge Nodes
        setTimeout(() => {
            let response = "I've analyzed your request.";
            let node: any = null;

            if (textToSend.toLowerCase().includes("epic") || textToSend.toLowerCase().includes("cinematic")) {
                response = "If you seek the epic, I suggest looking into 'The Dark Knight' or 'Interstellar'. These are currently trending high in our Masterpieces archive.";
                node = { type: "knowledge", title: "Fun Fact", content: "Did you know Christopher Nolan uses IMAX cameras for increased immersion?" };
            } else if (textToSend.toLowerCase().includes("drama")) {
                response = "Deep drama requires focus. I recommend 'The Whale' or 'Manchester by the Sea'. These will surely resonate.";
            }

            setMessages(prev => [...prev, {
                role: "ai",
                text: response,
                node: node,
                isAction: true
            }]);
        }, 1000);
    };

    const changePersona = (pKey: keyof typeof PERSONAS) => {
        setPersona(PERSONAS[pKey]);
        localStorage.setItem("vision_persona", pKey);
        setMessages([{ role: "ai", text: PERSONAS[pKey].tone }]);
        hapticImpact();
    };

    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-[10001] w-14 h-14 bg-gradient-to-tr from-primary to-blue-400 rounded-full shadow-[0_10px_40px_rgba(255,107,53,0.5)] flex items-center justify-center text-white border-2 border-white/20"
                    >
                        <HiSparkles size={28} />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-6 z-[10001] w-[350px] max-h-[600px] bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header with Persona Switcher */}
                        <div className="p-5 border-b border-white/5 bg-gradient-to-r from-primary/10 to-transparent">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary rounded-2xl rotate-3 flex items-center justify-center shadow-lg shadow-primary/20">
                                        <HiSparkles size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-base tracking-tight">{persona.name}</h3>
                                        <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{persona.description}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition">
                                    <IoMdClose size={20} />
                                </button>
                            </div>

                            <div className="flex gap-2">
                                {Object.keys(PERSONAS).map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => changePersona(key as keyof typeof PERSONAS)}
                                        className={`flex-1 py-1 px-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border ${persona.name === PERSONAS[key as keyof typeof PERSONAS].name ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {key}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-grow overflow-y-auto p-5 flex flex-col gap-5 scrollbar-hide">
                            {messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex flex-col gap-2 ${m.role === "ai" ? "self-start items-start" : "self-end items-end"}`}
                                >
                                    <div className={`max-w-[90%] p-4 rounded-3xl text-[13px] leading-relaxed shadow-sm ${m.role === "ai"
                                        ? "bg-white/5 text-gray-100 border border-white/10 rounded-tl-none"
                                        : "bg-primary text-black font-semibold rounded-tr-none"
                                        }`}
                                    >
                                        {m.text}
                                    </div>

                                    {/* Knowledge Node Block */}
                                    {m.node && (
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="w-[90%] bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 flex gap-3 items-start"
                                        >
                                            <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                                                <IoMdCompass size={14} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">{m.node.title}</p>
                                                <p className="text-[11px] text-gray-300 italic">"{m.node.content}"</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {m.isAction && m.role === "ai" && (
                                        <button
                                            onClick={() => {
                                                setIsOpen(false);
                                                dispatch(setSpotlightOpen(true));
                                            }}
                                            className="mt-1 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[11px] font-bold text-white transition flex items-center gap-2 group"
                                        >
                                            <IoMdCompass className="text-primary group-hover:rotate-90 transition-transform duration-500" />
                                            Browse Discovery
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white/5 border-t border-white/5">
                            <div className="flex flex-wrap gap-2 mb-4 px-1">
                                {QUICK_PROMPTS.map((p, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(p)}
                                        className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] text-gray-400 font-medium transition-all hover:border-primary/30"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3 items-center">
                                <button
                                    onClick={toggleListening}
                                    className={`w-12 h-12 rounded-2xl transition-all flex items-center justify-center ${isListening ? 'bg-red-500 shadow-lg shadow-red-500/40 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                                >
                                    {isListening ? <IoMdMicOff size={24} className="animate-pulse" /> : <IoMdMic size={24} />}
                                </button>
                                <div className="flex-grow relative">
                                    <input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                                        placeholder={isListening ? "Listening..." : "Tell Vision..."}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white outline-none focus:border-primary transition shadow-inner"
                                    />
                                    <button
                                        onClick={() => handleSend()}
                                        disabled={!input.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 text-primary hover:text-primary/10 transition disabled:opacity-0"
                                    >
                                        <IoMdSend size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default VisionAssistant;
