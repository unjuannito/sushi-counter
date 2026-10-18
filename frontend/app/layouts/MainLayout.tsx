import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import Footer from "~/components/Footer";
// import LoginDialog from "~/components/LoginDialog";
import AuthRequiredDialog from "~/components/auth/AuthRequiredDialog";
import { useAuth } from "~/hooks/useAuth";
import WebSocketService from '~/services/webSocketService'; // Importar WebSocketService
import CookieBanner from "~/components/legal/CookieBanner";
import { useLanguage } from "~/context/LanguageContext";

// This is the main layout for most pages
export default function Layout() {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // If there is an auth token, we are logged in, just connect websocket
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (authToken && user) {
      const webSocketService = WebSocketService.getInstance();
      webSocketService.connect();
      return;
    }

  }, [user, loading])

  // Public pages must be present in the initial HTML, including for crawlers
  // that do not run JavaScript or wait for the session check to finish.
  const publicRoutes = ["/", "/legal-notice", "/privacy-policy", "/cookies-policy"];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  if (loading && !isPublicRoute) {
    return <main className="flex-1 w-full overflow-y-auto flex justify-center items-center p-0 text-[1.5rem] font-bold bg-[#1a1a1a]">{t('Loading...')}</main>;
  }

  const handleCancelAuthRequired = () => {
    navigate("/"); // Redirect to index
  };

  if (!loading && !user && !isPublicRoute) {
    return (
      <>
        <AuthRequiredDialog isOpen onCancel={handleCancelAuthRequired} />
        <CookieBanner />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Outlet />
      <CookieBanner />
      <Footer />
    </>
  );
}
