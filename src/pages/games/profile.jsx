import React from "react";
import { Link } from "react-router-dom";
import ProfileHeader from "../../assets/profileIcon.png";
import profile from "../../assets/profile.png";
import Navbar from "../../components/homeNavbar";
import Trophy from "../../assets/trophy.png";
import Badge from "../../assets/badge.png";
import Coin from "../../assets/coin.png";

export default function Profile() {
  const badges = [
    { id: 1, img: Badge, unlocked: true },
    { id: 2, img: Badge, unlocked: true },
    { id: 3, img: Badge, unlocked: false },
    { id: 4, img: Badge, unlocked: true },
    { id: 5, img: Badge, unlocked: false },
    { id: 6, img: Badge, unlocked: true },
    { id: 7, img: Badge, unlocked: false },
    { id: 8, img: Badge, unlocked: true },
    { id: 9, img: Badge, unlocked: true },
    { id: 10, img: Badge, unlocked: true },
    { id: 11, img: Badge, unlocked: false },
    { id: 12, img: Badge, unlocked: true },
    { id: 13, img: Badge, unlocked: false },
    { id: 14, img: Badge, unlocked: true },
    { id: 15, img: Badge, unlocked: false },
    { id: 16, img: Badge, unlocked: true },
    // add more...
  ];

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-gray-200 flex items-center justify-center p-3 sm:p-6">
        <div className="w-full min-w-0 max-w-7xl bg-white rounded-2xl p-4 sm:p-10 shadow-sm">
          <div className="flex justify-center mb-10">
            <div className="relative">
              <img
                src={ProfileHeader}
                alt="Profile"
                className="w-full max-w-xl"
              />
            </div>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <img
                src={profile}
                alt="avatar"
                className="w-36 h-36 rounded-full object-cover"
              />

              <div className="absolute bottom-2 right-2 bg-gray-200 p-1 rounded-md text-xs cursor-pointer">
                ✏️
              </div>
            </div>

            <h2 className="mt-4 font-semibold text-gray-800">Player 123</h2>
            <p className="text-sm text-gray-500">danieldavid@gmail.com</p>
          </div>

          <div className="flex justify-center gap-6 mb-10 flex-wrap">
            <div className="w-full sm:w-auto bg-purple-100 rounded-xl px-5 sm:px-10 py-4 flex items-center gap-3">
              <div className=" w-full bg-white p-4 rounded-full flex items-center justify-center">
                <img
                  src={Trophy}
                  className=" w-10 h-10"
                  alt="badge"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500">Level</p>
                <p className="font-semibold">28</p>
              </div>
            </div>

            <div className="w-full sm:w-auto bg-yellow-100 rounded-xl px-5 sm:px-10 py-3 flex items-center gap-3">
              <div className=" w-full bg-white p-4 rounded-full flex items-center justify-center">
                <img
                  src={Coin}
                  className=" w-10 h-10"
                  alt="badge"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500">Coins</p>
                <p className="font-semibold">1400</p>
              </div>
            </div>

            <div className="w-full sm:w-auto bg-blue-100 rounded-xl px-5 sm:px-10 py-3 flex items-center gap-3">
              <div className=" w-full bg-white p-4 rounded-full flex items-center justify-center">
                <img
                  src={Badge}
                  className=" w-10 h-10"
                  alt="badge"
                />
              </div>
              <div>
                <p className="text-base text-[#000000]">Badge</p>
                <p className="font-semibold">4</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-base text-black mb-4">Badge Collection</p>

            <div className="grid grid-cols-3 min-[400px]:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3 rounded-xl flex items-center justify-center transition
         ${badge.unlocked ? "bg-purple-50" : "bg-gray-100 opacity-40"}
           `}
                >
                  <img
                    src={badge.img}
                    alt="badge"
                    className={`w-10 h-10 ${
                      !badge.unlocked ? "grayscale" : ""
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 sm:mt-10 flex justify-center sm:justify-end border-t border-gray-100 pt-6">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-8 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
            >
              Log out
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
