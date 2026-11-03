import { useLocation, useNavigate } from "react-router-dom";

export default function BackButton({ fallback = "/profiles", children = "← Back", className = "", ...props }) {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    if (location.key !== "default") navigate(-1);
    else navigate(fallback, { replace: true });
  };

  return <button type="button" onClick={goBack} className={className} {...props}>{children}</button>;
}
