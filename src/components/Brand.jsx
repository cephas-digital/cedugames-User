import logo from "../assets/cedugames-logo.png";

export function BrandLogo({ className = "", priority = false }) {
  return <img src={logo} alt="Cedugames" className={`object-contain ${className}`} fetchPriority={priority ? "high" : "auto"} />;
}

export function BrandLoader({ message = "Loading fun…", fullScreen = false }) {
  return (
    <div className={`${fullScreen ? "min-h-screen" : "min-h-[60vh]"} brand-loader`} role="status" aria-live="polite">
      <BrandLogo className="brand-loader__logo" priority={fullScreen} />
      <span className="brand-loader__dots" aria-hidden="true"><i /><i /><i /></span>
      <p>{message}</p>
    </div>
  );
}
