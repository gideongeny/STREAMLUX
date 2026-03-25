import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const PrivacyPolicy = () => {
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

        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-gray-400 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p>
              StreamLux collects minimal information necessary to provide our streaming services. 
              We may collect:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
              <li>Account information (if you create an account)</li>
              <li>Usage data and preferences</li>
              <li>Device information for compatibility</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p>
              We use collected information to:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
              <li>Provide and improve our streaming services</li>
              <li>Personalize your viewing experience</li>
              <li>Communicate with you about our services</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your information. 
              However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">4. Third-Party Services</h2>
            <p>
              Our website may contain links to third-party services. We are not responsible for 
              the privacy practices of these external sites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">5. Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
              <li>Access your personal information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of data collection</li>
              <li>Modify your account settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">6. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us through our 
              social media channels or email.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

