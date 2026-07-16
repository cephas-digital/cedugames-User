// import React, { useState } from "react";
// import Navbar from "../../components/homeNavbar";
// import Coin from "../../assets/coin.png";
// import CoinHeader from "../../assets/coin-header.png";

// const coins = Array(8).fill({
//   amount: "10,000 coins",
//   price: "₦1000",
// });

// export default function CoinShop() {
//   const [activeTab, setActiveTab] = useState("coins");

//   return (
//     <div>
//       <Navbar />

//       <div className="min-h-screen bg-gray-200 flex items-center justify-center p-6">
//         <div className="w-full max-w-7xl bg-white rounded-2xl p-8 shadow-sm">
//           <div className="flex justify-center mb-8">
//             <div className="relative">
//               <img
//                 src={CoinHeader}
//                 alt="Coin Shop"
//                 className="w-full max-w-xl"
//               />

//               <div className="absolute -left-6 top-2 w-6 h-6 bg-purple-400 rotate-45"></div>
//               <div className="absolute -right-6 top-2 w-6 h-6 bg-purple-400 rotate-45"></div>
//             </div>
//           </div>

//           <div className="flex justify-center space-x-10  gap-16 mb-8 text-base font-bold">
//             <button
//               onClick={() => setActiveTab("coins")}
//               className={`pb-2 border-b-2 ${
//                 activeTab === "coins"
//                   ? "text-[#9B5DE5] border-[#9B5DE5]"
//                   : "text-gray-400 border-transparent"
//               }`}
//             >
//               Coin List
//             </button>

//             <button
//               onClick={() => setActiveTab("history")}
//               className={`pb-2 border-b-2 ${
//                 activeTab === "history"
//                   ? "text-[#9B5DE5] border-[#9B5DE5]"
//                   : "text-gray-400 border-transparent"
//               }`}
//             >
//               Coin History
//             </button>
//           </div>

//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
//             {coins.map((coin, index) => (
//               <div
//                 key={index}
//                 className="bg-gray-50 rounded-xl p-4 flex flex-col items-center shadow-sm"
//               >
//                 <p className="text-sm font-medium text-black mb-2">
//                   {coin.amount}
//                 </p>

//                 <div className="w-28 h-28 rounded-full flex items-center justify-center mb-3 shadow-inner">
//                   <img
//                     src={Coin}
//                     alt="Coin"
//                   />
//                 </div>

//                 <button className="mt-auto shadow-[0_4px_8px_rgba(0,0,0,0.1)] bg-[#9B5DE5] text-white text-sm px-4 py-1 rounded-full ">
//                   {coin.price}
//                 </button>
//               </div>
//             ))}
//           </div>

//           <div className="flex items-center justify-between mt-10 text-sm text-gray-500">
//             <p>Showing 1-8 of 72 users</p>

//             <div className="flex items-center gap-2">
//               <button className="px-3 py-1 border rounded-md">Previous</button>
//               <button className="px-3 py-1 bg-purple-500 text-white rounded-md">
//                 1
//               </button>
//               <button className="px-3 py-1 border rounded-md">2</button>
//               <button className="px-3 py-1 border rounded-md">3</button>
//               <button className="px-3 py-1 border rounded-md">Next</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import Navbar from "../../components/homeNavbar";
import Coin from "../../assets/coin.png";
import CoinHeader from "../../assets/coin-header.png";

const coins = Array(8).fill({
  amount: "10,000 coins",
  price: "₦1000",
});

// 👉 NEW: Coin history data
const historyData = [
  {
    date: "October 2025",
    items: [
      { amount: "10,000 coins", time: "2:30pm 11/08/2025", ref: "N1000" },
      { amount: "15,500 coins", time: "3:00pm 11/08/2025", ref: "N1001" },
      { amount: "8,250 coins", time: "4:15pm 11/08/2025", ref: "N1002" },
      { amount: "20,000 coins", time: "5:40pm 11/08/2025", ref: "N1003" },
    ],
  },
  {
    date: "October 2025",
    items: [
      { amount: "10,000 coins", time: "2:30pm 11/08/2025", ref: "N1000" },
    ],
  },
];

export default function CoinShop() {
  const [activeTab, setActiveTab] = useState("coins");

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-gray-200 flex items-center justify-center p-3 sm:p-6">
        <div className="w-full min-w-0 max-w-7xl bg-white rounded-2xl p-4 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="flex justify-center mb-8">
            <div className="relative max-w-full px-4 sm:px-6">
              <img
                src={CoinHeader}
                alt="Coin Shop"
                className="w-full max-w-xl"
              />
              <div className="absolute left-0 top-2 w-4 h-4 sm:w-6 sm:h-6 bg-purple-400 rotate-45"></div>
              <div className="absolute right-0 top-2 w-4 h-4 sm:w-6 sm:h-6 bg-purple-400 rotate-45"></div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-8 sm:gap-16 mb-8 text-base font-bold">
            <button
              onClick={() => setActiveTab("coins")}
              className={`pb-2 cursor-pointer border-b-2 ${
                activeTab === "coins"
                  ? "text-[#9B5DE5] border-[#9B5DE5]"
                  : "text-gray-400 border-transparent"
              }`}
            >
              Coin List
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`pb-2 cursor-pointer border-b-2 ${
                activeTab === "history"
                  ? "text-[#9B5DE5] border-[#9B5DE5]"
                  : "text-gray-400 border-transparent"
              }`}
            >
              Coin History
            </button>
          </div>

          {activeTab === "coins" && (
            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {coins.map((coin, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-4 flex flex-col items-center shadow-sm"
                >
                  <p className="text-sm font-medium text-black mb-2">
                    {coin.amount}
                  </p>

                  <div className="w-28 h-28 flex items-center justify-center mb-3">
                    <img
                      src={Coin}
                      alt="Coin"
                    />
                  </div>

                  <button className="mt-auto shadow-[0_4px_8px_rgba(0,0,0,0.1)] bg-[#9B5DE5] text-white text-sm px-4 py-1 rounded-full">
                    {coin.price}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-6">
              {historyData.map((section, i) => (
                <div key={i}>
                  <p className="text-base text-black mb-3">{section.date}</p>

                  <div className="space-y-3">
                    {section.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 bg-gray-50 rounded-xl px-2 sm:px-4 py-2 sm:py-1 shadow-sm"
                      >
                        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                          <img
                            src={Coin}
                            alt="coin"
                            className="w-14 h-14 sm:w-20 sm:h-20 shrink-0"
                          />

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-black">
                              {item.amount}
                            </p>
                            <p className="text-xs text-gray-400">{item.time}</p>
                          </div>
                        </div>

                        <button className="shrink-0 bg-[#9B5DE5] cursor-pointer shadow-xl text-white text-xs px-3 sm:px-6 py-2 rounded-full">
                          {item.ref}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 text-sm text-gray-500">
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
