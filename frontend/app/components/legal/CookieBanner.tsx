import { useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import { useLanguage } from '~/context/LanguageContext';

export default function CookieBanner() {
  const { t } = useLanguage();
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
      className="fixed bottom-0 left-0 z-50 flex w-full flex-col items-center justify-between border-t border-[#62594d] bg-[#26241f] p-4 text-[#f6f0e7] shadow-2xl sm:flex-row"
      role="alertdialog"
      aria-live="polite"
    >
      <div className="flex-1 mr-0 sm:mr-4 mb-4 sm:mb-0 text-sm md:text-base text-left">
        <h3 className="font-bold text-lg mb-1 !text-left">{t('Cookie Notice')}</h3>
        <p className="text-gray-300">
          {t('We use our own strictly necessary cookies to keep your sessions secure and allow you to log in. These essential cookies work even if you reject the rest. We may also use third-party cookies to analyze traffic. You can accept all cookies or reject non-essential ones. For more information, read our')} <NavLink to="/cookies-policy" className="underline text-[#fb715a]">{t('Cookies Policy')}</NavLink>.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
        <button
          onClick={handleReject}
          className="secondary-button text-sm"
        >
          {t('Reject Non-Essential')}
        </button>
        <button
          onClick={handleAccept}
          className="primary-button text-sm"
        >
          {t('Accept All')}
        </button>
      </div>
    </div>
  );
}
