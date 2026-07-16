import React from "react";
import Navbar from "../../components/homeNavbar";
import LeaderboardIcon from "../../assets/leaderboard.png";
import Alex from "../../assets/userone.png";
import Sophie from "../../assets/usertwo.png";
import Ryan from "../../assets/userthree.png";

const users = [
  {
    id: 1,
    name: "Alex Martinez",
    level: 45,
    points: "12,450",
    avatar: Alex,
    rank: 1,
    bg: "bg-yellow-100",
    badge: "bg-yellow-500",
  },
  {
    id: 2,
    name: "Sophie Anderson",
    level: 42,
    points: "11,890",
    avatar: Sophie,
    rank: 2,
    bg: "bg-gray-100",
    badge: "bg-gray-400",
  },
  {
    id: 3,
    name: "Ryan Thompson",
    level: 40,
    points: "10,567",
    avatar: Ryan,
    rank: 3,
    bg: "bg-orange-100",
    badge: "bg-orange-500",
  },
];

export default function Leaderboard() {
  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-200 flex items-center justify-center p-3 sm:p-6">
        <div className="w-full min-w-0 max-w-7xl bg-white rounded-2xl p-4 sm:p-8 shadow-sm">
          <div className="flex justify-center mb-8">
            <img
              src={LeaderboardIcon}
              alt="Leaderboard"
              className="w-full max-w-2xl"
            />
          </div>
          {/* <div className="flex justify-center items-end gap-6 mb-10">
            <div className="flex flex-col items-center">
              <div className="w-40 h-32 bg-blue-200 rounded-md flex items-center justify-center text-center">
                <div>
                  <p className="text-sm font-medium">Player 123</p>
                  <p className="text-xs text-gray-600">Level 1</p>
                  <p className="text-xs">900,000</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-44 h-40 bg-purple-200 rounded-md flex items-center justify-center text-center shadow">
                <div>
                  <p className="text-sm font-medium">Player 123</p>
                  <p className="text-xs text-gray-600">Level 1</p>
                  <p className="text-xs">900,000</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-36 h-28 bg-orange-200 rounded-md flex items-center justify-center text-center">
                <div>
                  <p className="text-sm font-medium">Player 123</p>
                  <p className="text-xs text-gray-600">Level 1</p>
                  <p className="text-xs">900,000</p>
                </div>
              </div>
            </div>
          </div> */}

          {/* Users List */}
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            All Users
          </h3>

          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className={`flex min-w-0 items-center justify-between gap-3 p-3 sm:p-4 rounded-xl ${user.bg}`}
              >
                <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-sm font-semibold ${user.badge}`}
                  >
                    {user.rank}
                  </div>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-gray-500">Level {user.level}</p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold">{user.points}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-sm text-gray-500">
            <p>Showing 1-8 of 72 users</p>

            <div className="flex flex-wrap justify-center items-center gap-2">
              <button className="px-3 py-1 border rounded-md">Previous</button>
              <button className="px-3 py-1 bg-purple-500 text-white rounded-md">
                1
              </button>
              <button className="px-3 py-1 border rounded-md">2</button>
              <button className="px-3 py-1 border rounded-md">3</button>
              <button className="px-3 py-1 border rounded-md">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
