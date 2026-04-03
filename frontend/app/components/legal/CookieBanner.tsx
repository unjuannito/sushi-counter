import { useState, useEffect } from 'react';
import { NavLink } from 'react-router';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already made a decision about cookies
    const cookieConsent = localStorage.getItem('cookieConcent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConcent', 'accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConcent', 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 w-full bg-[#111] text-white p-4 border-t border-[#333] z-50 flex flex-col sm:flex-row items-center justify-between shadow-lg"
      role="alertdialog"
      aria-live="polite"
    >
      <div className="flex-1 mr-0 sm:mr-4 mb-4 sm:mb-0 text-sm md:text-base text-left">
        <h3 className="font-bold text-lg mb-1 !text-left">Cookie Notice</h3>
        <p className="text-gray-300">
          We use our own strictly necessary cookies to keep your sessions secure and allow you to log in. These essential cookies work even if you reject the rest.
          We may also use third-party cookies to analyze traffic. You can accept all cookies or reject non-essential ones.
          For more information, read our <NavLink to="/cookies-policy" className="underline text-[#646cff] hover:text-[#535bf2]">Cookies Policy</NavLink>.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
        <button
          onClick={handleReject}
          className="px-4 py-2 border border-gray-500 rounded bg-transparent hover:bg-gray-800 transition-colors text-sm font-semibold select-none cursor-pointer"
        >
          Reject Non-Essential
        </button>
        <button
          onClick={handleAccept}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg text-sm font-semibold select-none cursor-pointer"
        >
          Accept All
        </button>
      </div>
    </div>
  );
}
