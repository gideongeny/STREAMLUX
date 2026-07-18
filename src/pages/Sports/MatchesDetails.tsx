import { FC, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

/**
 * DEPRECATED: Redirecting to the elite SportsWatchPage
 */
const MatchesDetails: FC = () => {
    const { fixtureId } = useParams<{ fixtureId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // If we have match info in state or URL, propagate it
        const queryParams = new URLSearchParams(location.search);
        const home = queryParams.get("home");
        const away = queryParams.get("away");
        const sport = queryParams.get("sport") || "soccer";
        
        // Target the new elite watch route
        const targetPath = `/sports/arena/${fixtureId}?home=${home || ""}&away=${away || ""}&sport=${sport}`;
        navigate(targetPath, { replace: true });
    }, [fixtureId, location, navigate]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
};

export default MatchesDetails;
