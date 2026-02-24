import { FC, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiSparkles } from "react-icons/hi";
import { IoMdSend, IoMdClose, IoMdCompass, IoMdMic, IoMdMicOff } from "react-icons/io";
import { hapticImpact } from "../../shared/utils";
import { useAppDispatch } from "../../store/hooks";
import { setSpotlightOpen } from "../../store/slice/uiSlice";
import { toast } from "react-toastify";

const QUICK_PROMPTS = [
    "Find me something 🍿 Epic & Cinematic",
    "I'm in the mood for 🎭 Deep Drama",
    "Show me 🌌 Mind-bending Sci-Fi",
    "I want to 🤣 Laugh Out Loud",
];

const VisionAssistant: FC = () => {
    const dispatch = useAppDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<any[]>([
        { role: "ai", text: "Greetings. I am Vision. How can I elevate your cinematic journey today?" }
    ]);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = "en-US";

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
                hapticImpact();
                // Auto-send voice input
                setTimeout(() => handleSend(transcript), 500);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
                toast.error("Vision couldn't hear you. Please try again.");
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            toast.warning("Voice discovery is not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setInput("");
            recognitionRef.current.start();
            setIsListening(true);
            hapticImpact();
        }
    };

    const handleSend = (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim()) return;
        hapticImpact();
        setMessages(prev => [...prev, { role: "user", text: textToSend }]);
        setInput("");

        // Simulate AI Discovery Logic
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: "ai",
                text: "I've analyzed your request. I recommend exploring the 'Masterpieces' category in Spotlight Search for the best matches.",
                isAction: true
            }]);
        }, 1000);
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
                        className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-[10001] w-14 h-14 bg-gradient-to-tr from-primary to-blue-400 rounded-full shadow-[0_10px_30px_rgba(255,107,53,0.4)] flex items-center justify-center text-white border-2 border-white/20"
                    >
                        <HiSparkles size={28} />
                        <motion.div
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-full border-2 border-primary"
                        />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-6 z-[10001] w-[350px] max-h-[500px] bg-black/60 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-primary/10">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                    <HiSparkles size={16} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm tracking-tight">Vision AI</h3>
                                    <p className="text-[10px] text-primary font-black uppercase tracking-widest">Intelligent Butler</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition">
                                <IoMdClose size={24} />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide">
                            {messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: m.role === "ai" ? -10 : 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${m.role === "ai"
                                        ? "bg-white/5 text-gray-200 self-start border border-white/5 rounded-tl-none"
                                        : "bg-primary text-white self-end rounded-tr-none shadow-lg shadow-primary/20"
                                        }`}
                                >
                                    {m.text}
                                    {m.isAction && (
                                        <button
                                            onClick={() => {
                                                setIsOpen(false);
                                                dispatch(setSpotlightOpen(true));
                                            }}
                                            className="mt-3 w-full py-2.5 bg-primary/20 hover:bg-primary/40 border border-primary/30 rounded-xl font-bold uppercase tracking-tighter transition flex items-center justify-center gap-2 group"
                                        >
                                            <IoMdCompass className="group-hover:rotate-45 transition-transform" />
                                            Open Discoverer
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white/5">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {QUICK_PROMPTS.map((p, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(p)}
                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] text-gray-300 transition"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <div className="p-4 border-t border-white/5 flex gap-2 items-center relative">
                                {isListening && (
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="absolute left-4 w-10 h-10 bg-primary/40 rounded-full blur-lg"
                                    />
                                )}
                                <button
                                    onClick={toggleListening}
                                    className={`p-2.5 rounded-xl transition-all ${isListening ? 'bg-primary text-black' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                                >
                                    {isListening ? <IoMdMicOff size={22} className="animate-pulse" /> : <IoMdMic size={22} />}
                                </button>
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                                    placeholder={isListening ? "Listening..." : "Ask Vision anything..."}
                                    className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary/50 transition"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim()}
                                    className="p-2.5 bg-primary text-black rounded-xl hover:bg-primary/80 transition disabled:opacity-50 disabled:grayscale"
                                >
                                    <IoMdSend size={22} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default VisionAssistant;
