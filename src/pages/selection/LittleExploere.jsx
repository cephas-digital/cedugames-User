import React from "react";
import Navbar from "../../components/navbar";
import kid1 from "../../assets/math.png";
import kid2 from "../../assets/english.png";

import welcome from "../../assets/image.png";
import AgeCard from "../../components/ageCard";
// import { useParams } from "react-router-dom";
import WelcomeCard from "../../components/welcomeCard";

const LittleExploere = () => {
  // const { group } = useParams();

  // console.log(`Selected Group: ${{ group }}`);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="px-3 sm:px-6 lg:px-10 py-4 sm:py-8 space-y-6 sm:space-y-10">
        <WelcomeCard
          image={welcome}
          header={`Pick a Subject and Let’s Play to Learn! `}
          text="Welcome to CeduGames, Pick your age group to unlock games made just for you. Each level is packed with fun challenges that help you learn, think, and play smarter!"
        />

        <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-sm">
          <h2 className="text-gray-700 text-base mb-6">Select your subject</h2>

          <div className="grid md:grid-cols-3 py-6 gap-6">
            <AgeCard
              link="/age-selection/little-explore/math"
              image={kid1}
              title="Math Adventures"
              className="justify-center items-center"
              description="Solve puzzles, count treasures, and become a number wizard!"
              color="bg-purple-50 rounded-md border-purple-200"
            />

            <AgeCard
              link="/age-selection/little-explore/english"
              image={kid2}
              title="English Adventures"
              className="justify-center items-center"
              description="Solve puzzles, count treasures, and become a number wizard!"
              color="bg-orange-50 border-orange-200 rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LittleExploere;
