import logo from "../assets/logo.png";

function Navbar() {
  return (
    <div className="w-full flex justify-between items-center px-4 sm:px-10 py-3 sm:py-4 bg-white shadow-sm">
      <h1 className="text-xl font-bold text-purple-600 leading-tight">
        <img
          src={logo}
          className=" w-20"
          alt="Logo"
        />
      </h1>

      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-500 text-white cursor-pointer">
        <span className="text-lg">👤</span>
      </div>
    </div>
  );
}

export default Navbar;
