import { FC } from "react";
import Title from "../../components/Common/Title";
import SportsWatchPage from "../../features/sports/SportsWatchPage";

const SportsWatch: FC = () => {
  return (
    <>
      <Title value="StreamLux | Live Stadium Experience" />
      <div className="bg-black min-h-screen">
          <SportsWatchPage />
      </div>
    </>
  );
};

export default SportsWatch;
