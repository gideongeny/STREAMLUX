import React, { FC } from 'react';

interface LogoProps {
  className?: string;
}

const Logo: FC<LogoProps> = ({ className = "w-10 h-10" }) => (
  <svg 
    className={className}
    viewBox="0 0 512 512" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="512" height="512" rx="120" fill="var(--color-primary, #FF6B35)" className="transition-colors duration-[800ms]" />
    <path d="M256 120L360 260H290V360H222V260H152L256 120Z" fill="white"/>
    <circle cx="256" cy="410" r="25" fill="white"/>
  </svg>
);

export default Logo;
