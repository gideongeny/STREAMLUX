import { FunctionComponent } from "react";
import { Link } from "react-router-dom";
import { SiTiktok } from "react-icons/si";
import { BsInstagram, BsWhatsapp, BsFacebook } from "react-icons/bs";

interface FooterProps {}

const Footer: FunctionComponent<FooterProps> = () => {
  return (
    <footer className="bg-dark-lighten text-white mt-8 border-t border-gray-800 relative z-20 w-full">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-6">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">StreamLux</h3>
            <p className="text-gray-400 text-sm">
              Your destination for free movies, TV shows, and live sports streaming. 
              Discover world cinema from around the globe.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-gray-400 hover:text-primary transition">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-400 hover:text-primary transition">
                  Search
                </Link>
              </li>
              <li>
                <Link to="/sports" className="text-gray-400 hover:text-primary transition">
                  Sports
                </Link>
              </li>
              <li>
                <Link to="/download" className="text-gray-400 hover:text-primary transition">
                  Download App
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xl font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-primary transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/user-agreement" className="text-gray-400 hover:text-primary transition">
                  User Agreement
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-gray-400 hover:text-primary transition">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/copyright" className="text-gray-400 hover:text-primary transition">
                  Copyright
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <p className="text-gray-400 text-sm mb-4">
              Reach out to us on social media:
            </p>
            <div className="flex gap-3">
              <a
                href="https://tiktok.com/@gideongeny07"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition duration-300"
                aria-label="TikTok"
              >
                <SiTiktok size={24} />
              </a>
              <a
                href="https://instagram.com/gideo.cheruiyot.2025"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition duration-300"
                aria-label="Instagram"
              >
                <BsInstagram size={24} />
              </a>
              <a
                href="https://www.facebook.com/gideo.cheruiyot.2025"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition duration-300"
                aria-label="Facebook"
              >
                <BsFacebook size={24} />
              </a>
              <a
                href="https://wa.me/254720317626"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition duration-300"
                aria-label="WhatsApp"
              >
                <BsWhatsapp size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Backlinks Section */}
        <div className="border-t border-gray-800 pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Backlinks & Partners</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <a
              href="https://novelhub.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary transition"
            >
              Novel Hub
            </a>
            <a
              href="https://moviebox.ph"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary transition"
            >
              MovieBox
            </a>
            <a
              href="https://netnaija.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary transition"
            >
              NetNaija
            </a>
            <a
              href="https://sflix.to"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary transition"
            >
              SFlix
            </a>
            <a
              href="https://sportslive.run"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary transition"
            >
              SportsLive
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-gray-800 pt-6 mt-6">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            <strong>Disclaimer:</strong> All content on this page is provided for testing and 
            demonstration purposes only. All video streams, images, and texts are sourced from 
            publicly available websites. We do not store, record, or upload any content ourselves. 
            All copyrights belong to the original owners. If any content violates your rights, 
            please <Link to="/copyright" className="text-primary hover:underline">contact us</Link> for removal.
          </p>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} StreamLux. All rights reserved.
            </p>
            <p className="text-xs">
              Made with ❤️ for movie and TV show enthusiasts worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
