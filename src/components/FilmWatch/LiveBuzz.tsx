import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, onSnapshot, updateDoc, arrayUnion, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../shared/firebase';
import { useAppSelector } from '../../store/hooks';
import { FiMessageSquare } from 'react-icons/fi';
import { hapticImpact } from '../../shared/utils';

interface LiveBuzzProps {
  mediaId: string | number;
  mediaType: "movie" | "tv";
  isVisible?: boolean;
}

interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  timestamp: number;
}

const EMOJIS = ['😂', '😮', '😍', '👏', '🔥', '😱'];

const LiveBuzz: React.FC<LiveBuzzProps> = ({ mediaId, mediaType, isVisible = true }) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const currentUser = useAppSelector((state) => state.auth.user);
  const containerRef = useRef<HTMLDivElement>(null);

  // Floating animations for incoming reactions
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; xOffset: number }[]>([]);

    useEffect(() => {
    if (!mediaId || !mediaType) return;

    const docId = `${mediaType}_${mediaId.toString()}`;
    const buzzRef = doc(db, 'livebuzz', docId);

    // Ensure document exists
    getDoc(buzzRef).then(snap => {
      if (!snap.exists()) {
        setDoc(buzzRef, { recentReactions: [] }, { merge: true }).catch(() => {});
      }
    }).catch(err => {
        if (err?.code === 'permission-denied') {
            console.log("[LiveBuzz] Access denied. Real-time buzz disabled.");
        }
    });

    const unsubscribe = onSnapshot(buzzRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const newReactions = data.recentReactions as Reaction[] || [];
        
        // Find reactions we haven't animated yet (basic filter by timestamp in last 5 secs)
        const now = Date.now();
        const recentNew = newReactions.filter(r => 
          now - r.timestamp < 5000 && 
          !reactions.some(existing => existing.id === r.id)
        );

        if (recentNew.length > 0) {
          const toFloat = recentNew.map(r => ({
            id: r.id,
            emoji: r.emoji,
            xOffset: Math.random() * 60 - 30 // Random horizontal drift (-30px to 30px)
          }));
          
          setFloatingEmojis(prev => [...prev, ...toFloat]);
          
          // Cleanup floating emojis after animation (3s)
          setTimeout(() => {
            setFloatingEmojis(prev => prev.filter(e => !toFloat.some(t => t.id === e.id)));
          }, 3000);
        }

        setReactions(newReactions);
      }
    }, (error) => {
        if (error?.code === 'permission-denied') {
            console.log("[LiveBuzz] Snapshot denied.");
        }
    });

    return () => unsubscribe();
  }, [mediaId, mediaType, reactions]);

  const handleSendReaction = useCallback(async (emoji: string) => {
    if (!currentUser || !mediaId) return;

    hapticImpact();
    setShowPicker(false);

    const docId = `${mediaType}_${mediaId.toString()}`;
    const buzzRef = doc(db, 'livebuzz', docId);
    
    const reaction: Reaction = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      emoji,
      userId: currentUser.uid,
      timestamp: Date.now()
    };

    try {
      await updateDoc(buzzRef, {
        recentReactions: arrayUnion(reaction)
      } as any);
      // Optionally trim the array via cloud function or keep it bounded on client
    } catch (error) {
      console.warn('Failed to send reaction:', error);
    }
  }, [currentUser, mediaId, mediaType]);

  if (!isVisible) return null;

  return (
    <div className="absolute right-4 bottom-[20%] z-50 pointer-events-none flex flex-col items-end" ref={containerRef}>
      
      {/* Floating Emojis Area */}
      <div className="relative w-16 h-64 mb-4" style={{ pointerEvents: 'none' }}>
        <AnimatePresence>
          {floatingEmojis.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50, x: 0, scale: 0.5 }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                y: -250, 
                x: item.xOffset,
                scale: [0.5, 1.2, 1, 0.8]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: "easeOut" }}
              className="absolute bottom-0 text-3xl will-change-transform drop-shadow-md"
              style={{ left: '50%', marginLeft: '-18px' }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Controller (pointer-events-auto so it can be clicked) */}
      <div className="relative pointer-events-auto">
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              className="absolute right-14 bottom-0 bg-dark/80 backdrop-blur-md border border-white/10 rounded-full py-2 px-3 flex gap-2 shadow-2xl"
            >
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleSendReaction(emoji)}
                  className="text-2xl hover:scale-125 transition-transform origin-bottom"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => {
            hapticImpact();
            setShowPicker(!showPicker);
          }}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
            showPicker ? 'bg-primary text-white scale-110' : 'bg-dark/60 text-white/70 hover:bg-dark/80 backdrop-blur-sm border border-white/20'
          }`}
        >
          <FiMessageSquare size={20} />
          {reactions.length > 0 && !showPicker && (
            <span className="absolute -top-1 -right-1 bg-primary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              +
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default LiveBuzz;
