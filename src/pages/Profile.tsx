import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { FunctionComponent, useRef, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Title from "../components/Common/Title";
import Footer from "../components/Footer/Footer";
import { themeService, themes } from "../services/theme";
import DeleteAccount from "../components/Profile/DeleteAcount";
import Email from "../components/Profile/Email";
import EmailVerification from "../components/Profile/EmailVerification";
import Name from "../components/Profile/Name";
import Password from "../components/Profile/Password";
import ProfileImage from "../components/Profile/ProfileImage";
import { auth, functions } from "../shared/firebase";
import { httpsCallable } from "firebase/functions";
import { useAppSelector } from "../store/hooks";
import { convertErrorCodeToMessage } from "../shared/utils";
import { ToastContainer, toast } from "react-toastify";
import BlackBackdrop from "../components/Common/BlackBackdrop";
import { AiOutlineArrowRight, AiOutlineCheckCircle, AiOutlineStar } from "react-icons/ai";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
interface ProfileProps { }

const Profile: FunctionComponent<ProfileProps> = () => {
  const [isSidebarActive, setIsSidebarActive] = useState(false);

  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const emailValueRef = useRef<HTMLInputElement>(null!);

  const [isUpdatedPassword, setIsUpdatedPassword] = useState(false);
  const oldPasswordValueRef = useRef<HTMLInputElement>(null!);
  const newPasswordValueRef = useRef<HTMLInputElement>(null!);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isShowPromptReAuthFor, setIsShowPromptReAuthFor] = useState<
    string | undefined
  >();
  const firebaseUser = auth.currentUser;
  const user = useAppSelector((state) => state.auth.user);
  const isPremium = user?.isPremium;

 

  const reAuthentication = async (type: string) => {
    const oldPassword = oldPasswordValueRef.current.value;

    if (!oldPassword.trim().length) {
      // alert("You gotta type something");
      toast.error("You gotta type something", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    const credential = EmailAuthProvider.credential(
      // @ts-ignore
      firebaseUser.email,
      oldPassword
    );

    reauthenticateWithCredential(
      // @ts-ignore
      firebaseUser,
      credential
    )
      .then(() => {
        if (type === "password") {
          changePassword();
        } else if (type === "email") {
          changeEmail();
        } else if (type === "delete") {
          deleteAccount();
        }

        setIsShowPromptReAuthFor(undefined);
      })
      .catch((error) => {
        console.log(error);
        // alert(convertErrorCodeToMessage(error.code));
        toast.error(convertErrorCodeToMessage(error.code), {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      });
  };

  const changeEmail = () => {
    const emailValue = emailValueRef.current.value;

    setIsUpdating(true);
    // @ts-ignore
    updateEmail(firebaseUser, emailValue)
      .then(() => {
        setIsUpdatingEmail(false);
        // window.location.reload();
      })
      .catch((error) => {
        console.log(error);
        toast.error(convertErrorCodeToMessage(error.code), {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      })
      .finally(() => setIsUpdating(false));
  };

  const changePassword = () => {
    const newPassword = newPasswordValueRef.current.value;

    setIsUpdating(true);
    // @ts-ignore
    updatePassword(firebaseUser, newPassword)
      .then(() => {
        setIsUpdatedPassword(true);
        newPasswordValueRef.current.value = "";
      })
      .catch((error) => {
        console.log(error);
        toast.error(convertErrorCodeToMessage(error.code), {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      })
      .finally(() => setIsUpdating(false));
  };

  const deleteAccount = () => {
    setIsUpdating(true);
    // @ts-ignore
    deleteUser(firebaseUser).finally(() => {
      setIsUpdating(false);
    });
  };

  return (
    <>
      <Title value="Profile | StreamLux" />

      <ToastContainer />

      {/* Removed mobile header */}

      {isShowPromptReAuthFor && (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              reAuthentication(isShowPromptReAuthFor);
            }}
            className="z-10 fixed md:w-[500px] md:min-h-[200px] min-h-[230px] top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 left-[5%] right-[5%] bg-dark-lighten rounded-md px-3 py-2"
          >
            <p className="text-white font-medium mb-6 text-lg text-center">
              Type your password again to reauthenticate
            </p>
            <input
              ref={oldPasswordValueRef}
              type="password"
              autoFocus
              className="bg-dark-lighten-2 py-3 rounded-md px-5 text-white mb-4 w-full"
              placeholder="Type your password..."
            />
            <button className="px-6 py-2 bg-dark-lighten-2 rounded-xl hover:brightness-125 transition duration-300 text-white md:top-[130px] top-[160px] tw-absolute-center-horizontal">
              Continue
            </button>
          </form>
          <BlackBackdrop
            onCloseBlackBackdrop={() => setIsShowPromptReAuthFor(undefined)}
          />
        </>
      )}

      {isUpdating && (
        <>
          <div className="border-[8px] border-primary border-t-transparent h-32 w-32 rounded-full animate-spin fixed top-[40%] left-[40%] z-10"></div>
          <BlackBackdrop className="!z-[5]" />
        </>
      )}

      <div className="flex">
        <div className="flex-grow md:pl-10 px-3 relative overflow-hidden">
          {/* Elite Header Ambient Glow */}
          <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary/10 via-transparent to-transparent -z-10 blur-[50px] md:blur-[100px] md:animate-pulse opacity-50 md:opacity-100" />

          <div className="pb-8 pt-10 border-b border-white/5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-2"
            >
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-primary font-black uppercase tracking-tighter">Elite Discovery Center</div>
            </motion.div>
            <h1 className="text-4xl md:text-6xl text-white font-black uppercase tracking-tighter">
              Account<span className="text-primary">.</span>Settings
            </h1>
            <p className="text-gray-500 mt-2 font-bold uppercase text-[10px] tracking-widest">Elevating your StreamLux Experience</p>
          </div>
          <div className="flex flex-col-reverse md:flex-row gap-8 md:gap-0 ">
            <div className="flex-grow">
              {!firebaseUser && (
                <div className="mt-10 mb-8 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-8 md:p-12 rounded-[40px] border border-primary/20 shadow-2xl text-center flex flex-col items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <AiOutlineStar size={120} className="text-primary" />
                  </div>
                  <div className="relative z-10">
                    <h2 className="text-3xl md:text-5xl text-white font-black uppercase tracking-tighter mb-4">
                      Join the <span className="text-primary italic">Elite</span>
                    </h2>
                    <p className="text-gray-300 text-sm md:text-base mb-8 max-w-[500px] mx-auto leading-relaxed">
                      Sign in or create an account to unlock premium tracking, sync your bookmarks, and customize your StreamLux experience across all your devices.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Link to="/auth" className="px-10 py-4 bg-primary text-black font-black rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(255,107,53,0.4)] uppercase tracking-widest text-sm border border-primary">
                        Sign In / Sign Up
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {firebaseUser && (
                <>
                  <div className="mt-10">
                    <h2 className="text-white text-2xl font-black uppercase tracking-tighter mb-4 flex items-center gap-3">
                      <span className="w-8 h-1 bg-primary rounded-full" />
                      User Intelligence
                    </h2>
                    <p className="text-gray-400 text-sm max-w-[500px]">Securely manage your identity and discovery credentials.</p>
                  </div>

                  <div className="mt-7 max-w-[600px] w-full flex flex-col gap-3">
                    <Email
                      onShowPromptReAuthForEmail={() =>
                        setIsShowPromptReAuthFor("email")
                      }
                      isUpdatingEmail={isUpdatingEmail}
                      setIsUpdatingEmail={setIsUpdatingEmail}
                      emailValueRef={emailValueRef}
                    />
                    <Name setIsUpdating={setIsUpdating} />
                  </div>
                </>
              )}

              <div className="mt-12">
                <h2 className="text-white text-2xl font-black uppercase tracking-tighter mb-4 flex items-center gap-3">
                  <span className="w-8 h-1 bg-blue-500 rounded-full" />
                  Atmospheric Themes
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {themes.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => themeService.setThemeByName(theme.name)}
                      className="group relative aspect-video rounded-2xl overflow-hidden border border-white/5 hover:border-primary transition"
                    >
                      <div
                        className="absolute inset-0 opacity-40 group-hover:opacity-60 transition"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* StreamLux Pro Section */}
              <div className="mt-12 group relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-8 rounded-[40px] border border-primary/20 shadow-2xl transition-all hover:border-primary/40">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <AiOutlineStar size={120} className="text-primary" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-primary/20 p-3 rounded-2xl border border-primary/20">
                      <AiOutlineStar size={32} className="text-primary animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl text-white font-black uppercase tracking-tighter">
                        StreamLux <span className="text-primary italic">Pro</span>
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="h-1 w-8 bg-primary rounded-full" />
                        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Lifetime Ad-Free Access</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <AiOutlineCheckCircle size={20} className="text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-white/80 font-medium text-sm italic tracking-tight">Zero Ads, Zero Interruptions. Forever.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <AiOutlineCheckCircle size={20} className="text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-white/80 font-medium text-sm italic tracking-tight">Priority Streaming & Discovery Engine.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <AiOutlineCheckCircle size={20} className="text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-white/80 font-medium text-sm italic tracking-tight">Support the evolution of Elite software.</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-4">
                      {isPremium ? (
                        <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 px-8 py-4 rounded-3xl shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                          <AiOutlineCheckCircle size={28} className="text-primary" />
                          <span className="text-white font-black text-xl uppercase tracking-tighter">Premium Active (Ad-Free)</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center md:items-end p-6 bg-white/5 border border-white/10 rounded-3xl">
                          <p className="text-gray-400 text-xs uppercase font-black tracking-widest text-center md:text-right">Manual Ad-Free Upgrades Only</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
              </div>

              {firebaseUser && (
                <div className="mt-12 bg-white/5 p-6 rounded-3xl border border-white/5 mb-20">
                  <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Security Controls</h3>
                  <EmailVerification setIsUpdating={setIsUpdating} />

                  <Password
                    onShowPromptReAuthForPassword={() =>
                      setIsShowPromptReAuthFor("password")
                    }
                    isUpdatedPassword={isUpdatedPassword}
                    setIsUpdatedPassword={setIsUpdatedPassword}
                    newPasswordValueRef={newPasswordValueRef}
                  />

                    <DeleteAccount
                    onShowPromptReAuthForDeleteAccount={() =>
                      setIsShowPromptReAuthFor("delete")
                    }
                  />
                </div>
              )}

              {/* General Information Section migrated from legacy sidebar */}
              <div className="mt-12 mb-20">
                <h2 className="text-white text-2xl font-black uppercase tracking-tighter mb-4 flex items-center gap-3">
                  <span className="w-8 h-1 bg-gray-500 rounded-full" />
                  General & Legal
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <a href="https://github.com/STREAMLUX/STREAMLUX" target="_blank" rel="noreferrer" className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 transition flex flex-col gap-1">
                    <span className="text-white font-bold text-sm">Check for Updates</span>
                    <span className="text-gray-500 text-xs">Visit Official Website</span>
                  </a>
                  <Link to="/ai" className="bg-white/5 hover:bg-primary/20 p-4 rounded-2xl border border-white/5 hover:border-primary/50 transition flex flex-col gap-1">
                    <span className="text-primary font-bold text-sm">Genius AI Assistant</span>
                    <span className="text-gray-500 text-xs">AI Powered Discoveries</span>
                  </Link>
                  <a href="https://g.co/kgs/4nLpS2q" target="_blank" rel="noreferrer" className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 transition flex flex-col gap-1">
                    <span className="text-white font-bold text-sm">Find us on Google</span>
                    <span className="text-gray-500 text-xs">Leave a review</span>
                  </a>
                  <a href="https://doc-hosting.flycricket.io/streamlux-privacy-policy/98a39151-51de-4674-8d4e-0309990e796e/privacy" target="_blank" rel="noreferrer" className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 transition flex flex-col gap-1">
                    <span className="text-white font-bold text-sm">Privacy Policy</span>
                    <span className="text-gray-500 text-xs">User Agreement</span>
                  </a>
                </div>
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p className="text-red-400 font-bold text-xs uppercase mb-1 tracking-widest">Disclaimer</p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    StreamLux does not store any files on our server, we only linked to the media which is hosted on 3rd party services.
                  </p>
                </div>
              </div>
            </div>
            {firebaseUser && <ProfileImage />}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Profile;
