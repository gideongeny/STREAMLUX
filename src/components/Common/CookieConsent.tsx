import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { analytics } from '../../shared/firebase';

const CookieConsent: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay so it doesn't jarringly appear immediately on load
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);
    // If the user accepts, we could explicitly initialize analytics here if needed.
    // Since Firebase analytics is initialized in firebase.ts, we can just reload 
    // or rely on next session for full tracking.
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    // Disable tracking manually
    localStorage.setItem('analytics_disabled', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 pointer-events-none flex justify-center"
        >
          <div className="pointer-events-auto bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-sm text-gray-300">
              <h3 className="text-white font-bold text-base mb-1">
                {t('Privacy & Cookies')}
              </h3>
              <p className="leading-relaxed">
                {t('We use cookies and similar technologies to enhance your experience, analyze our traffic, and personalize content. By clicking "Accept", you agree to our ')}
                <Link to="/privacy" className="text-primary hover:underline font-medium">
                  {t('Privacy Policy')}
                </Link>.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={handleDecline}
                className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-white/20 text-gray-300 hover:text-white hover:bg-white/10 transition font-medium text-sm"
              >
                {t('Decline')}
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 md:flex-none px-6 py-2 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition shadow-[0_0_15px_rgba(var(--color-primary),0.3)] text-sm"
              >
                {t('Accept')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
