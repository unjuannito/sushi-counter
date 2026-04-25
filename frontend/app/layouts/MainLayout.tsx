import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import Footer from "~/components/Footer";
// import LoginDialog from "~/components/LoginDialog";
import AuthRequiredDialog from "~/components/auth/AuthRequiredDialog";
import { useAuth } from "~/hooks/useAuth";
import WebSocketService from '~/services/webSocketService'; // Importar WebSocketService
import CookieBanner from "~/components/legal/CookieBanner";

// This is the main layout for most pages
export default function Layout() {
  const [showAuthRequired, setShowAuthRequired] = useState<boolean>(false);
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

    // If no user and not on index/login/register, and not already showing a dialog, show auth required
    const authRoutes = ["/", "/login", "/register", "/legal-notice", "/privacy-policy", "/cookies-policy"];
    const isAuthRoute = authRoutes.includes(location.pathname);

    if (!user && !isAuthRoute && !showAuthRequired) {
      setShowAuthRequired(true);
      return;
    }

    // The index page ("/") is now a landing page and should be accessible to everyone.
    // We only prompt for auth when trying to access protected content.
  }, [user, showAuthRequired, loading, location.pathname])

  if (loading) {
    return <main className="flex-1 w-full overflow-y-auto flex justify-center items-center p-0 text-[1.5rem] font-bold bg-[#1a1a1a]">Loading...</main>;
  }

  const handleCancelAuthRequired = () => {
    setShowAuthRequired(false);
    navigate("/"); // Redirect to index
  };

  return (
    <>
      <AuthRequiredDialog
        isOpen={showAuthRequired}
        onCancel={handleCancelAuthRequired}
      />
      <Outlet />
      <CookieBanner />
      <Footer />
    </>
  );
}
