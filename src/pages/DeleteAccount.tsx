import { FC } from "react";
import { Link } from "react-router-dom";
import { IoArrowBack, IoTrashOutline, IoWarningOutline } from "react-icons/io5";
import Title from "../components/Common/Title";

const DeleteAccount: FC = () => {
  return (
    <>
      <Title value="Delete Account | StreamLux" />
      <div className="min-h-screen bg-dark text-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors inline-flex"
          >
            <IoArrowBack size={20} />
            <span>Back to Home</span>
          </Link>

          <div className="bg-dark-lighten p-8 rounded-2xl border border-white/5 shadow-2xl">
            <div className="flex items-center gap-4 mb-6 text-red-500">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <IoTrashOutline size={32} />
              </div>
              <h1 className="text-3xl font-bold">Delete Your Account</h1>
            </div>

            <p className="text-gray-300 leading-relaxed mb-8">
              We are sorry to see you go. Please note that account deletion is permanent and cannot be undone.
              All your data, including your library, history, and preferences, will be removed from our servers.
            </p>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-8 flex gap-4">
              <IoWarningOutline size={24} className="text-red-500 shrink-0" />
              <div>
                <h3 className="font-bold text-red-500 mb-1">Warning: Permanent Action</h3>
                <p className="text-sm text-red-400/80">
                  Deleting your account will immediately revoke your access to Premium features and remove all saved data. 
                  This process is irreversible.
                </p>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4">How to Delete Your Account</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 font-bold">1</div>
                <div>
                  <h4 className="font-bold mb-1">Delete via Mobile App (Recommended)</h4>
                  <p className="text-sm text-gray-400">
                    Open the StreamLux app, go to <strong>Profile &gt; Settings</strong> and tap on <strong>Delete Account</strong>. 
                    This will instantly remove your data.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 font-bold">2</div>
                <div>
                  <h4 className="font-bold mb-1">Delete via Website</h4>
                  <p className="text-sm text-gray-400">
                    Sign in to your account on the web, go to your <strong>Profile</strong> settings, and select 
                    the delete option.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 font-bold">3</div>
                <div>
                  <h4 className="font-bold mb-1">Email Request</h4>
                  <p className="text-sm text-gray-400">
                    If you cannot access your account, email us at <a href="mailto:support@streamlux.app" className="text-primary hover:underline">support@streamlux.app</a> 
                    from your registered email address with the subject "Account Deletion Request".
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5">
              <p className="text-xs text-gray-500 text-center">
                Processing requests via email may take up to 48 hours. For instant deletion, please use the in-app feature.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteAccount;
