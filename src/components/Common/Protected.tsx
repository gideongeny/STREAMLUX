import { FunctionComponent } from "react";
import { Link, Navigate } from "react-router-dom";

interface ProtectedProps {
  isSignedIn: boolean;
  children: React.ReactNode;
}

const Protected: FunctionComponent<ProtectedProps> = ({
  isSignedIn,
  children,
}) => {
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl font-bold mb-4">Sign In Required</h1>
          <p className="text-gray-400 mb-8 text-lg">
            Please sign in or create an account to access this page.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition font-medium text-lg"
            >
              Sign In / Sign Up
            </Link>
            <Link
              to="/"
              className="px-8 py-3 bg-dark-lighten text-white rounded-lg hover:bg-dark-lighten-2 transition font-medium text-lg"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

export default Protected;
