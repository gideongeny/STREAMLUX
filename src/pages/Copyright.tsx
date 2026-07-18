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
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
            Copyright & Compliance Portal
          </h1>

          <div className="space-y-8">
            {/* Legislative Compliance */}
            <section className="bg-dark-lighten p-6 rounded-2xl border border-white/5">
              <h2 className="text-2xl font-semibold mb-4 text-primary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Legal Framework
              </h2>
              <p className="text-gray-300 leading-relaxed">
                StreamLux operates in strict adherence to international copyright treaties and local regulations, 
                specifically the <strong>Copyright and Related Rights Act (Kenya)</strong>. 
                We are committed to the support, promotion, and protection of intellectual property 
                in accordance with Articles 11(2)(c) and 40(5) of the Constitution of Kenya.
              </p>
            </section>

            {/* Online Intermediary Status */}
            <section className="bg-dark-lighten p-6 rounded-2xl border border-white/5">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Online Intermediary Safe Harbor
              </h2>
              <p className="text-gray-300 leading-relaxed">
                As per <strong>Section 81</strong> of the Copyright and Related Rights Bill, StreamLux acts as an 
                Online Intermediary. We do not initiate the transmission of infringing content, 
                nor do we select or modify the content provided by third-party aggregators. 
                Our platform functions solely as a metadata portal and indexing service for 
                Free-to-Air (FTA) and publicly accessible content.
              </p>
            </section>

            {/* Takedown Policy */}
            <section className="bg-dark-lighten p-6 rounded-2xl border border-white/5" id="takedown">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Expeditious Removal (Takedown) Policy
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                In compliance with <strong>Section 82</strong>, we provide a structured mechanism for 
                rights holders to report infringement. Upon receipt of a valid takedown notice, 
                StreamLux will disable access to the infringing content within <strong>48 hours</strong>.
              </p>
              <div className="bg-dark p-4 rounded-xl border border-red-500/20">
                <h3 className="text-lg font-bold text-red-400 mb-2">Notice Requirements:</h3>
                <ul className="text-sm text-gray-400 space-y-2 ml-4 list-disc">
                  <li>Full identification of the copyrighted work.</li>
                  <li>URL or specific location of the infringing link.</li>
                  <li>Statement of ownership or authorization.</li>
                  <li>Contact details of the Complainant.</li>
                  <li>Attestation of Good Faith.</li>
                </ul>
                <p className="mt-4 font-bold text-primary">Email: dmca@streamlux.app</p>
              </div>
            </section>

            {/* Repeat Infringer Policy */}
            <section className="bg-dark-lighten p-6 rounded-2xl border border-white/5">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Repeat Infringer Policy
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Pursuant to <strong>Section 81(2)(e)</strong>, StreamLux maintains a strict Repeat Infringer Policy. 
                Accounts or sources found to be consistently providing infringing links will be 
                permanently banned from our platform. We utilize violation tracking to ensure 
                continued compliance with judicial and Authority orders.
              </p>
            </section>

            {/* Disability Access */}
            <section className="bg-dark-lighten p-6 rounded-2xl border border-white/5">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Accessible Format Copies
              </h2>
              <p className="text-gray-300 leading-relaxed">
                In line with <strong>Section 33</strong> and the Marrakesh Treaty, we support the 
                provision of accessible format copies for persons with disabilities. 
                We facilitate access to literary and artistic works for beneficiary persons 
                on a non-commercial basis to ensure equitable access to information.
              </p>
            </section>

            {/* Designated Agent */}
            <section className="bg-dark-lighten p-6 rounded-2xl border border-white/5">
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Designated Agent
              </h2>
              <p className="text-gray-300 leading-relaxed">
                StreamLux has designated the following agent for the receipt of notices 
                under <strong>Section 86</strong>:
              </p>
              <div className="mt-4 p-4 bg-dark/50 rounded-lg">
                <p className="text-gray-200">Legal Compliance Officer</p>
                <p className="text-gray-400">StreamLux Media Group</p>
                <p className="text-gray-400">Email: legal@streamlux.app</p>
              </div>
            </section>

            {/* User Disclaimer */}
            <section className="bg-dark p-6 rounded-2xl border border-primary/20">
              <h2 className="text-xl font-bold mb-2">User Disclaimer</h2>
              <p className="text-sm text-gray-400">
                StreamLux is a neutral platform. Users are reminded that unauthorized 
                reproduction or communication of copyrighted works may lead to 
                civil liability or criminal prosecution under the Copyright and 
                Related Rights Act.
              </p>
            </section>

            {/* Back to Home */}
            <div className="text-center mt-12 pb-12">
              <Link
                to="/"
                className="inline-block px-8 py-3 bg-primary text-white rounded-full hover:scale-105 transition-all shadow-lg shadow-primary/20 font-bold"
              >
                ← Return to StreamLux
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


