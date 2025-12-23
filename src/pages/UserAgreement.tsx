import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const UserAgreement = () => {
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

        <h1 className="text-4xl font-bold mb-6">User Agreement</h1>
        <p className="text-gray-400 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using StreamLux, you accept and agree to be bound by the terms 
              and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">2. Use License</h2>
            <p>
              Permission is granted to temporarily access StreamLux for personal, non-commercial 
              transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">3. Restrictions</h2>
            <p>You are specifically restricted from:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
              <li>Republishing material from StreamLux</li>
              <li>Selling, sublicensing, or commercializing any website material</li>
              <li>Using this website in any way that is damaging or could damage the website</li>
              <li>Using this website contrary to applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">4. Content Disclaimer</h2>
            <p>
              All content on StreamLux is provided for testing and demonstration purposes only. 
              All video streams, images, and texts are sourced from publicly available websites. 
              We do not store, record, or upload any content ourselves. All copyrights belong to 
              the original owners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">5. No Warranties</h2>
            <p>
              This website is provided "as is" with all faults, and StreamLux makes no 
              representations or warranties of any kind related to this website or the materials 
              contained on this website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">6. Limitation of Liability</h2>
            <p>
              In no event shall StreamLux, nor its directors, employees, or agents, be liable 
              for any indirect, incidental, special, consequential, or punitive damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">7. Indemnification</h2>
            <p>
              You hereby indemnify StreamLux from and against any and all liabilities, costs, 
              demands, causes of action, damages, and expenses arising out of or in any way 
              related to your breach of any of the provisions of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">8. Variation of Terms</h2>
            <p>
              StreamLux is permitted to revise these terms at any time as it sees fit, and by 
              using this website you are expected to review such terms on a regular basis.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserAgreement;

