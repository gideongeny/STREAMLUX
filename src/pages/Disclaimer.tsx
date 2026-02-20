import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-dark text-white py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <IoArrowBack size={20} />
          <span>Back to Home</span>
        </Link>

        <h1 className="text-4xl font-bold mb-6">Disclaimer</h1>
        <p className="text-gray-400 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-gray-300">
          <section className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-red-400 mb-3">Important Notice</h2>
            <p className="text-white">
              <strong>All content on this page is provided for testing and demonstration purposes only.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">Content Disclaimer</h2>
            <p>
              StreamLux does not host, store, or upload any video content, movies, TV shows, or 
              sports streams. All video streams, images, and texts displayed on this website are 
              sourced from publicly available websites and third-party sources.
            </p>
            <p className="mt-3">
              We do not claim ownership of any content displayed on our platform. All copyrights 
              and intellectual property rights belong to their respective owners, including but not 
              limited to:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
              <li>Movie studios and production companies</li>
              <li>TV networks and broadcasters</li>
              <li>Sports leagues and organizations</li>
              <li>Content distributors and streaming platforms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">No Endorsement</h2>
            <p>
              The inclusion of any content, links, or references on StreamLux does not imply 
              endorsement, sponsorship, or affiliation with the content owners or providers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">User Responsibility</h2>
            <p>
              Users are solely responsible for ensuring that their use of StreamLux complies with 
              applicable laws and regulations in their jurisdiction. We do not encourage or condone 
              any illegal activity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">Copyright Infringement</h2>
            <p>
              If you believe that any content on StreamLux infringes your copyright, please contact 
              us immediately. We will promptly investigate and remove any content that violates 
              copyright laws upon verification.
            </p>
            <p className="mt-3">
              Contact information for copyright claims can be found in our <Link to="/copyright" className="text-primary hover:underline">Copyright</Link> page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">Limitation of Liability</h2>
            <p>
              StreamLux and its operators are not liable for any damages, losses, or legal issues 
              arising from the use of this website or the content displayed herein. Users access 
              and use this website at their own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">Third-Party Links</h2>
            <p>
              Our website may contain links to external websites and services. We are not 
              responsible for the content, privacy practices, or terms of service of these 
              third-party sites.
            </p>
          </section>

          <section className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-3">Legal Compliance</h2>
            <p className="text-white">
              By using StreamLux, you acknowledge that you have read, understood, and agree to 
              this disclaimer. If you do not agree with any part of this disclaimer, please 
              discontinue use of this website immediately.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;

