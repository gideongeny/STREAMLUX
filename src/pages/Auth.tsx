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
        <video
          autoPlay
          muted
          loop
          playsInline
          id="myVideo"
          className="fixed md:-top-[130px] -top-[155px] object-cover left-0 h-[135vh] w-full z-0 opacity-60"
          onLoadedData={(e) => {
            // Ensure video plays
            const video = e.target as HTMLVideoElement;
            video.play().catch(() => {
              // Auto-play failed, try again
              setTimeout(() => video.play(), 100);
            });
          }}
          onError={(e) => {
            // Fallback if video fails to load
            console.warn('Background video failed to load');
          }}
        >
          <source
            src="/auth-background.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      )}

      <div className="min-h-screen">
        {!isShowSignInBox && <SignUp setIsShowSignInBox={setIsShowSignInBox} />}
        {isShowSignInBox && <SignIn setIsShowSignInBox={setIsShowSignInBox} />}
      </div>
    </>
  );
};

export default Auth;
