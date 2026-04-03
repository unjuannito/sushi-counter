import { useNavigate } from "react-router";

export default function LegalHeader() {
  const navigate = useNavigate();

  return (
    <header className="w-full flex items-center p-4 border-b border-white/10 sticky top-0 bg-[#222222]/90 backdrop-blur-md z-10">
      <button 
        onClick={() => navigate('/user')} 
        className="text-gray-300 hover:text-white flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors font-medium"
      >
        <span className="text-2xl leading-none -mt-1">←</span>
        <span>Back to Profile</span>
      </button>
    </header>
  );
}
