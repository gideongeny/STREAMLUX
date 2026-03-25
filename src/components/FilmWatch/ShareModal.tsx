import { FC } from 'react';
import { AiOutlineClose, AiOutlineCopy, AiOutlineShareAlt } from 'react-icons/ai';
import { FaFacebook, FaTwitter, FaWhatsapp, FaTelegram } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    url: string;
}

const ShareModal: FC<ShareModalProps> = ({ isOpen, onClose, title, url }) => {
    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    const shareUrl = encodeURIComponent(url);
    const shareText = encodeURIComponent(`Watch ${title} on StreamLux!`);

    return (
        <>
            <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#1f1f1f] rounded-2xl w-[90%] max-w-md p-6 border border-white/10 shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <AiOutlineShareAlt className="text-primary" />
                        Share
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <AiOutlineClose size={24} />
                    </button>
                </div>

                <p className="text-gray-300 mb-2 text-sm">Share this title with your friends:</p>
                <div className="flex gap-4 justify-center mb-6">
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#1877f2] rounded-full text-white hover:opacity-90 transition transform hover:scale-110">
                        <FaFacebook size={20} />
                    </a>
                    <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#1da1f2] rounded-full text-white hover:opacity-90 transition transform hover:scale-110">
                        <FaTwitter size={20} />
                    </a>
                    <a href={`https://api.whatsapp.com/send?text=${shareText} ${shareUrl}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#25d366] rounded-full text-white hover:opacity-90 transition transform hover:scale-110">
                        <FaWhatsapp size={20} />
                    </a>
                    <a href={`https://t.me/share/url?url=${shareUrl}&text=${shareText}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#0088cc] rounded-full text-white hover:opacity-90 transition transform hover:scale-110">
                        <FaTelegram size={20} />
                    </a>
                </div>

                <p className="text-gray-300 mb-2 text-sm">Or copy link:</p>
                <div className="flex items-center gap-2 bg-[#121212] p-2 rounded-lg border border-gray-700">
                    <input
                        type="text"
                        readOnly
                        value={url}
                        className="bg-transparent text-gray-400 text-sm flex-1 outline-none truncate"
                    />
                    <button
                        onClick={handleCopy}
                        className="p-2 bg-primary/20 text-primary rounded-md hover:bg-primary hover:text-white transition duration-300"
                    >
                        <AiOutlineCopy size={18} />
                    </button>
                </div>
            </div>
        </>
    );
};

export default ShareModal;
