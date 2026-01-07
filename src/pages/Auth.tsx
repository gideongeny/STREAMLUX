import { FunctionComponent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SignIn from "../components/Auth/SignIn";
import SignUp from "../components/Auth/SignUp";
import Title from "../components/Common/Title";
import { useCurrentViewportView } from "../hooks/useCurrentViewportView";

interface AuthProps { }

const Auth: FunctionComponent<AuthProps> = () => {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [isShowSignInBox, setIsShowSignInBox] = useState(true);
  const { isMobile } = useCurrentViewportView();

  // If there's a redirect param, show sign in by default
  useEffect(() => {
    if (redirect) {
      setIsShowSignInBox(true);
    }
  }, [redirect]);
  return (
    <>
      <Title value={"Sign In | StreamLux"} />

      {!isMobile && (
        <div className="fixed top-0 left-0 w-full h-full -z-10 bg-black overflow-hidden pointer-events-none">
          <video
            className="w-full h-full object-cover opacity-100 scale-105"
            autoPlay
            loop
            muted
            playsInline
            src="/auth-background.mp4"
          />
          {/* Subtle overlay instead of heavy dark gradient */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      )}

      <div className="bg-transparent min-h-screen flex flex-col justify-center relative z-10">
        {!isShowSignInBox && <SignUp setIsShowSignInBox={setIsShowSignInBox} />}
        {isShowSignInBox && <SignIn setIsShowSignInBox={setIsShowSignInBox} />}
      </div>
    </>
  );
};

export default Auth;
