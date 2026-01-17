import { FC } from 'react';
import { BsCupHot } from 'react-icons/bs';

interface BuyMeACoffeeProps {
  variant?: 'button' | 'badge' | 'floating';
  className?: string;
}

const BuyMeACoffee: FC<BuyMeACoffeeProps> = ({ variant = 'button', className = '' }) => {
  const bmcUsername = process.env.REACT_APP_BMC_USERNAME || 'gideongeny';
  const bmcUrl = `https://buymeacoffee.com/${bmcUsername}`;

  if (variant === 'floating') {
    return (
      <a
        href={bmcUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#FFDD00] hover:bg-[#FFD700] text-[#000] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${className}`}
        aria-label="Buy me a coffee"
      >
        <BsCupHot size={20} />
        <span className="font-semibold text-sm hidden sm:inline">Buy me a coffee</span>
      </a>
    );
  }

  if (variant === 'badge') {
    return (
      <a
        href={bmcUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFDD00] hover:bg-[#FFD700] text-[#000] rounded-full text-sm font-medium transition-colors ${className}`}
        aria-label="Buy me a coffee"
      >
        <BsCupHot size={16} />
        <span>Support</span>
      </a>
    );
  }

  return (
    <a
      href={bmcUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-6 py-3 bg-[#FFDD00] hover:bg-[#FFD700] text-[#000] rounded-lg font-semibold transition-all duration-300 hover:shadow-lg ${className}`}
      aria-label="Buy me a coffee"
    >
      <BsCupHot size={20} />
      <span>Buy me a coffee</span>
    </a>
  );
};

export default BuyMeACoffee;
