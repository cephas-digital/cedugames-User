import { Link } from "react-router-dom";

function AgeCard({
  image,
  link,
  title,
  subtitle,
  bgImage,
  color,
  description,
  className,
}) {
  return (
    <Link
      to={link}
      className="block rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-300"
      aria-label={`Choose ${title}`}
    >
      <div
        className={`grid h-full cursor-pointer gap-4 rounded-2xl border-2 border-purple-300 bg-white/80 p-4 shadow-md transition duration-200 active:scale-[0.98] active:border-purple-600 sm:p-6 md:flex md:border-purple-100 md:shadow-sm md:hover:scale-[1.02] md:hover:border-purple-400 md:hover:shadow-lg lg:p-8 ${color || ""} ${className || ""}`}
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          // clipPath: "polygon(0 10%, 100% 0, 100% 100%, 0 100%)",
        }}
      >
        <img
          src={image}
          alt={title}
          className="w-32 sm:w-40 max-w-full mx-auto"
        />

        <div>
          <h3 className="font-semibold text-gray-700">{title}</h3>

          <p className="text-sm italic text-gray-500">{subtitle}</p>

          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
}

export default AgeCard;
