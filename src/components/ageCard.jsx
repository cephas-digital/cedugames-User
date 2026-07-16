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
    <Link to={link}>
      <div
        className={`p-4 sm:p-6 lg:p-10 h-auto ${color} ${className} md:flex grid gap-4 transition md:hover:scale-105 cursor-pointer`}
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          // clipPath: "polygon(0 10%, 100% 0, 100% 100%, 0 100%)",
        }}
      >
        <img
          src={image}
          alt="age group"
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
