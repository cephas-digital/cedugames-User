import Navbar from "../../components/navbar";
import WelcomeCard from "../../components/welcomeCard";
import AgeCard from "../../components/ageCard";
import one from "../../assets/one.png";
import two from "../../assets/two.png";
import tree from "../../assets/tree.png";
import kid1 from "../../assets/Gemini_Generated_Image_3m0zjq3m0zjq3m0z (1) 1.png";
import kid2 from "../../assets/Gemini_Generated_Image_skh2zvskh2zvskh2 (1) 1.png";
import kid3 from "../../assets/Gemini_Generated_Image_3m0zjq3m0zjq3m0z (1) 1.png";
import welcome from "../../assets/image.png";

function AgeSelection() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="px-3 sm:px-6 lg:px-10 py-4 sm:py-8 space-y-6 sm:space-y-10">
        <WelcomeCard
          image={welcome}
          text="  Welcome to CeduGames, Pick your
        age group to unlock games made just for you. Each level is packed with
        fun challenges that help you learn, think, and play smarter!"
        />

        <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-sm">
          <h2 className="text-gray-700 text-xl sm:text-2xl mb-6">Select your age group</h2>

          <div className="grid md:grid-cols-3 py-4  gap-6">
            <AgeCard
              link="/age-selection/little-explore"
              bgImage={one}
              image={kid1}
              title="Age 3-5: Little Explorers"
              subtitle="Learn through fun and play!"
              description="Discover colors, shapes, animals, and numbers with simple games that make learning exciting and easy to understand."
              // color="bg-purple-50 border-purple-200"
            />

            <AgeCard
              image={kid2}
              bgImage={two}
              title="Ages 6-8: Young Thinkers"
              subtitle="Solve, build, and explore!"
              description="Play games that boost creativity, problem solving, and memory. Learn new words, math tricks, and fun science facts!"
              // color="bg-orange-50 border-orange-200"
            />

            <AgeCard
              bgImage={tree}
              image={kid3}
              title="Ages 9-11: Smart Adventurers"
              subtitle="Challenge your mind!"
              description="Dive into brain games, quizzes, and creative missions that test your logic, teamwork, and curiosity about the world."
              // color="bg-blue-50 border-blue-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgeSelection;
