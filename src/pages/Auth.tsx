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
          <iframe
            className="w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60 scale-110"
            src="https://www.youtube.com/embed/_-Hsa9ROvZY?autoplay=1&mute=1&controls=0&loop=1&playlist=_-Hsa9ROvZY&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&modestbranding=1"
            title="Background"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>
      )}

      <div className="md:bg-black/80 bg-dark min-h-screen">
        {!isShowSignInBox && <SignUp setIsShowSignInBox={setIsShowSignInBox} />}
        {isShowSignInBox && <SignIn setIsShowSignInBox={setIsShowSignInBox} />}
      </div>
    </>
  );
};

export default Auth;
