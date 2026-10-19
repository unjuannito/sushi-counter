import { useLocation, useNavigate } from "react-router";

export default function LegalHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo === "/user" ? "/user" : "/";

  return (
    <header className="sticky top-0 z-10 flex w-full items-center border-b border-[#49443c] bg-[#211f1b]/90 p-4 backdrop-blur-md">
      <button 
        onClick={() => navigate(returnTo, { replace: true })}
        className="secondary-button gap-2 text-sm"
      >
        <span className="text-2xl leading-none -mt-1">←</span>
        <span>{returnTo === "/user" ? "Back to Profile" : "Back to Home"}</span>
      </button>
    </header>
  );
}
