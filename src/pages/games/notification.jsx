import React from "react";
import Navbar from "../../components/homeNavbar";
import NotificationHeader from "../../assets/notificationIcon.png";

export default function Notification() {
  const notifications = [
    {
      date: "October 2025",
      items: [
        {
          message:
            "Lorem ipsum dolor sit amet consectetur. Ullamcorper potenti facilisis mauris at magna enim urna consectetur dui. Scelerisque facilisis a sagittis tincidunt. Lorem ipsum dolor sit amet consectetur.",
          time: "2:30pm",
          fullDate: "11/08/2025",
        },
        {
          message:
            "Lorem ipsum dolor sit amet consectetur. Ullamcorper potenti facilisis mauris at magna enim urna consectetur dui. Scelerisque facilisis",
          time: "2:30pm",
          fullDate: "11/08/2025",
        },
        {
          message:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum. Curabitur pulvinar tellus a libero bibendum, vitae facilisis nisi fermentum.",
          time: "3:00pm",
          fullDate: "12/08/2025",
        },
      ],
    },
  ];

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-[#F7F6F8] flex items-center justify-center p-3 sm:p-6">
        <div className="w-full min-w-0 max-w-7xl bg-white rounded-2xl p-4 sm:p-10 shadow-sm">
          <div className="flex justify-center mb-10">
            <div className="relative">
              <img
                src={NotificationHeader}
                alt="Notification"
                className="w-full max-w-xl"
              />
            </div>
          </div>

          <div className="space-y-8">
            {notifications.map((section, i) => (
              <div key={i}>
                <p className="text-sm text-black mb-4">{section.date}</p>

                <div className="space-y-4">
                  {section.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 break-words"
                    >
                      <p className="text-sm text-black leading-relaxed">
                        {item.message}
                      </p>

                      <div className="flex justify-between mt-4 text-xs text-black">
                        <span>{item.time}</span>
                        <span>{item.fullDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 text-sm text-black">
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
