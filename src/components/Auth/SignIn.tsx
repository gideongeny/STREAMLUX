import { GoogleAuthProvider } from "firebase/auth";
import { FunctionComponent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { MdPersonAdd, MdArrowForward } from "react-icons/md";
import { useAppSelector } from "../../store/hooks";
import { signInWithProvider } from "./signInWithProvider";

interface SignInProps {
  setIsShowSignInBox: any;
}

const SignIn: FunctionComponent<SignInProps> = ({ setIsShowSignInBox }) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

  // Redirect after successful sign in
  useEffect(() => {
    if (currentUser) {
      if (redirect) {
        navigate(redirect, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [currentUser, navigate, redirect]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80 backdrop-blur-sm">
          <div className="w-20 h-20 border-[6px] rounded-full border-primary border-t-transparent animate-spin "></div>
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl max-w-md animate-fade-in-down border border-red-400/30">
          <p className="font-black uppercase tracking-widest text-xs mb-1 opacity-80">Sign In Failed</p>
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={() => setError("")}
            className="mt-3 text-xs uppercase tracking-wider font-bold underline hover:no-underline opacity-80 hover:opacity-100 transition-opacity"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="px-6 py-10 rounded-3xl max-w-md w-full min-h-[500px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark-lighten/60 backdrop-blur-2xl border border-white/10 shadow-cinema-card flex flex-col items-center justify-center">
        <div className="flex flex-col items-center mb-10 text-center w-full">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">
            Welcome to <span className="text-primary drop-shadow-[0_0_15px_rgba(255,107,53,0.5)]">StreamLux</span>
          </h2>
          <p className="text-gray-400 text-sm tracking-wide">
            Sign in to unlock premium features, save your watch history, and sync across devices.
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full">
          {/* Google Sign In */}
          <button
            type="button"
            onClick={async () => {
              setIsLoading(true);
              setError("");
              try {
                await signInWithProvider(new GoogleAuthProvider(), "google");
              } catch (err: any) {
                setError(err.message || "Failed to sign in with Google");
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="h-14 w-full rounded-2xl bg-white flex items-center justify-center gap-3 hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <FcGoogle size={24} className="group-hover:scale-110 transition-transform" />
            <span className="text-black font-black uppercase tracking-widest text-sm">Continue with Google</span>
          </button>

          <div className="flex items-center gap-4 my-2">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">OR</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Custom Account Setup */}
          <button
            type="button"
            onClick={() => navigate("/profile-setup")}
            disabled={isLoading}
            className="h-14 w-full rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center gap-3 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 group"
          >
            <MdPersonAdd size={22} className="text-primary group-hover:scale-110 transition-transform" />
            <span className="text-primary font-black uppercase tracking-widest text-sm drop-shadow-[0_0_8px_rgba(255,107,53,0.3)]">Create Custom Profile</span>
          </button>

          {/* Skip for now */}
          <button
            type="button"
            onClick={() => navigate("/")}
            disabled={isLoading}
            className="h-14 w-full rounded-2xl bg-transparent border border-white/10 flex items-center justify-center gap-2 hover:bg-white/5 hover:border-white/20 transition-all duration-300 text-gray-400 hover:text-white group mt-4"
          >
            <span className="font-bold uppercase tracking-widest text-xs">Skip For Now</span>
            <MdArrowForward size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </>
  );
};

export default SignIn;
