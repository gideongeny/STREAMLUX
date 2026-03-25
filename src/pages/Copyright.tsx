import { FC } from "react";
import { Link } from "react-router-dom";
import Title from "../components/Common/Title";
import Footer from "../components/Footer/Footer";

const Copyright: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <Title value="Copyright & Legal | StreamLux" />
      
      <div className="min-h-screen bg-dark text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Copyright & Legal Information
          </h1>

          <div className="space-y-8">
            {/* Copyright Notice */}
            <section className="bg-dark-lighten p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Copyright Notice
              </h2>
              <p className="text-gray-300 leading-relaxed">
                © {currentYear} StreamLux. All rights reserved.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                StreamLux ("we", "us", or "our") is a streaming platform that provides 
                access to movies, TV shows, and sports content. All content displayed 
                on this website is the property of their respective owners.
              </p>
            </section>

            {/* Website Ownership */}
            <section className="bg-dark-lighten p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Website Ownership
              </h2>
              <p className="text-gray-300 leading-relaxed">
                StreamLux is owned and operated by <strong>Gideon Geny</strong>.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                <strong>Contact Information:</strong>
              </p>
              <ul className="text-gray-300 mt-2 space-y-2 ml-4">
                <li>• Email: Available through contact form</li>
                <li>• Social Media: 
                  <a href="https://instagram.com/gideo.cheruiyot.2025" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2">
                    Instagram
                  </a>
                  {" | "}
                  <a href="https://www.facebook.com/gideo.cheruiyot.2025" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Facebook
                  </a>
                </li>
              </ul>
            </section>

            {/* Content Disclaimer */}
            <section className="bg-dark-lighten p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Content Disclaimer
              </h2>
              <p className="text-gray-300 leading-relaxed">
                StreamLux does not host, store, or distribute any video content. 
                We provide links to external streaming sources and aggregators. 
                All movies, TV shows, and sports content are the property of their 
                respective copyright holders.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                We respect intellectual property rights and comply with applicable 
                copyright laws. If you believe that any content on our website 
                infringes your copyright, please contact us immediately.
              </p>
            </section>

            {/* Third-Party Content */}
            <section className="bg-dark-lighten p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Third-Party Content
              </h2>
              <p className="text-gray-300 leading-relaxed">
                StreamLux uses data from The Movie Database (TMDB) API for movie 
                and TV show information. All movie posters, backdrops, and metadata 
                are provided by TMDB and are subject to their terms of service.
              </p>
              <p className="text-gray-300 leading-relaxed mt-4">
                Sports data is provided by third-party APIs and external streaming 
                aggregators. We do not claim ownership of any sports content or 
                streaming services.
              </p>
            </section>

            {/* User Responsibilities */}
            <section className="bg-dark-lighten p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                User Responsibilities
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Users are responsible for ensuring they have the legal right to 
                access and stream content in their jurisdiction. StreamLux is not 
                responsible for any illegal use of the website or its content.
              </p>
            </section>

            {/* DMCA Policy */}
            <section className="bg-dark-lighten p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                DMCA & Copyright Infringement
              </h2>
              <p className="text-gray-300 leading-relaxed">
                If you are a copyright owner and believe that content on StreamLux 
                infringes your rights, please contact us with the following information:
              </p>
              <ul className="text-gray-300 mt-4 space-y-2 ml-4 list-disc">
                <li>Your contact information</li>
                <li>Description of the copyrighted work</li>
                <li>URL of the infringing content</li>
                <li>Statement of good faith belief</li>
                <li>Your signature (electronic or physical)</li>
              </ul>
            </section>

            {/* Terms of Use */}
            <section className="bg-dark-lighten p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Terms of Use
              </h2>
              <p className="text-gray-300 leading-relaxed">
                By using StreamLux, you agree to:
              </p>
              <ul className="text-gray-300 mt-4 space-y-2 ml-4 list-disc">
                <li>Use the website only for lawful purposes</li>
                <li>Respect intellectual property rights</li>
                <li>Not reproduce or redistribute content without permission</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            {/* Privacy */}
            <section className="bg-dark-lighten p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Privacy
              </h2>
              <p className="text-gray-300 leading-relaxed">
                StreamLux respects user privacy. We use Firebase for authentication 
                and data storage. User data is handled in accordance with our 
                privacy policy and applicable data protection laws.
              </p>
            </section>

            {/* Updates */}
            <section className="bg-dark-lighten p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Policy Updates
              </h2>
              <p className="text-gray-300 leading-relaxed">
                This copyright notice may be updated from time to time. Users are 
                encouraged to review this page periodically for any changes. 
                Continued use of the website after changes constitutes acceptance 
                of the updated terms.
              </p>
              <p className="text-gray-400 text-sm mt-4">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </section>

            {/* Back to Home */}
            <div className="text-center mt-8">
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition font-medium"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Copyright;

