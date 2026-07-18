import { FC } from "react";
import { Link } from "react-router-dom";
import { IoArrowBack, IoShieldCheckmarkOutline } from "react-icons/io5";
import Title from "../components/Common/Title";

const PrivacyPolicy: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <Title value="Privacy Policy | StreamLux" />
      <div className="min-h-screen bg-dark text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors inline-flex"
          >
            <IoArrowBack size={20} />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <IoShieldCheckmarkOutline size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Privacy Policy</h1>
              <p className="text-gray-500 mt-1">Last Updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-10 text-gray-300 leading-relaxed">
            <section className="bg-dark-lighten p-8 rounded-2xl border border-white/5 shadow-xl">
              <h2 className="text-2xl font-bold mb-4 text-white">1. Introduction</h2>
              <p>
                Welcome to StreamLux ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy applies to all information collected through our website (streamlux-67a84.web.app), our mobile applications, and any related services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white border-l-4 border-primary pl-4">2. Information We Collect</h2>
              <div className="space-y-4">
                <p>We collect personal information that you voluntarily provide to us when you register on the App, express an interest in obtaining information about us or our products and services, or otherwise when you contact us.</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li><strong>Personal Identifiers:</strong> Names, email addresses, and profile pictures (when using Google Sign-In).</li>
                  <li><strong>Usage Data:</strong> We automatically collect certain information when you visit, use, or navigate the App. This includes device information (IP address, browser characteristics, operating system, device name).</li>
                  <li><strong>Media Preferences:</strong> We store your bookmarks, watch history, and preferences to provide a personalized experience.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white border-l-4 border-primary pl-4">3. How We Use Your Information</h2>
              <p>We use personal information collected via our App for a variety of business purposes described below:</p>
              <ul className="list-disc ml-6 mt-4 space-y-2">
                <li>To facilitate account creation and logon process (via Firebase Auth).</li>
                <li>To provide, operate, and maintain our Services.</li>
                <li>To improve, personalize, and expand our Services.</li>
                <li>To understand and analyze how you use our Services.</li>
                <li>To comply with legal obligations and prevent fraud.</li>
              </ul>
            </section>

            <section className="bg-primary/5 p-8 rounded-2xl border border-primary/20">
              <h2 className="text-2xl font-bold mb-4 text-white">4. Third-Party Services & Data Sharing</h2>
              <p>We use third-party services to enhance the functionality of our platform:</p>
              <ul className="list-disc ml-6 mt-4 space-y-4">
                <li><strong>Firebase (Google):</strong> Used for authentication, analytics, and database services. Your data is stored securely on Google Cloud servers.</li>
                <li><strong>TMDB API:</strong> We use The Movie Database API for movie and TV show metadata. No personal user data is shared with TMDB.</li>
                <li><strong>AdMob (Google):</strong> If applicable, we use AdMob to serve advertisements. AdMob may use device identifiers to serve personalized ads.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white border-l-4 border-primary pl-4">5. Data Retention & Deletion</h2>
              <p>
                We keep your personal information only for as long as it is necessary for the purposes set out in this privacy policy. 
              </p>
              <div className="mt-6 p-6 bg-red-500/10 rounded-xl border border-red-500/20">
                <h3 className="font-bold text-red-500 mb-2 uppercase tracking-wider text-sm">Your Right to Deletion</h3>
                <p className="text-sm">
                  You have the absolute right to request the deletion of your account and all associated data. You can do this directly within the mobile app in the <strong>Profile Settings</strong> or by visiting our <Link to="/delete-account" className="text-primary hover:underline">Account Deletion Page</Link>.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white border-l-4 border-primary pl-4">6. Security of Your Information</h2>
              <p>
                We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white border-l-4 border-primary pl-4">7. Contact Us</h2>
              <p>
                If you have questions or comments about this policy, you may email us at:
              </p>
              <p className="mt-2 font-bold text-primary text-xl">support@streamlux.app</p>
              <p className="mt-4 text-gray-500">
                StreamLux Media Group<br />
                Privacy Compliance Department
              </p>
            </section>

            <footer className="text-center pt-12 border-t border-white/5 text-gray-600 text-sm">
              <p>&copy; {currentYear} StreamLux Media Group. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
