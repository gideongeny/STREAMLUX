import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiExternalLink } from 'react-icons/fi';

interface VidVaultPortalProps {
  isOpen: boolean;
  url: string;
  title: string;
  onClose: () => void;
}

const VidVaultPortal: React.FC<VidVaultPortalProps> = ({ isOpen, url, title, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  const openInNewTab = () => {
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) window.location.assign(url);
    onClose();
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="VidVault download portal"
    >
      <div
        className="w-full max-w-md my-auto bg-[#111114] border border-white/10 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="min-w-0 pr-2">
            <p className="text-primary text-[10px] font-black uppercase tracking-widest">Option 2 — VidVault</p>
            <p className="text-white text-sm font-bold truncate mt-0.5">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white shrink-0"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <p className="text-sm text-gray-300 leading-relaxed">
            VidVault opens in a <strong className="text-white">new browser tab</strong> with your title pre-filled.
            Pick a quality there and download using your browser — same as visiting VidVault directly.
          </p>

          <p className="text-[10px] text-gray-500 font-mono break-all leading-relaxed">{url}</p>

          <button
            onClick={openInNewTab}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all"
          >
            <FiExternalLink size={14} />
            Open VidVault (New Tab)
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default VidVaultPortal;
