function AuthCard({ children }) {
  return (
    <div className="bg-white w-full max-w-125 rounded-2xl shadow-lg p-5 sm:p-10">
      {children}
    </div>
  );
}

export default AuthCard;
