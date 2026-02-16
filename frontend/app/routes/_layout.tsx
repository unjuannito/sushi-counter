import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import Footer from "~/components/Footer";
import LoginDialog from "~/components/LoginDialog";
import AuthRequiredDialog from "~/components/auth/AuthRequiredDialog";
import { useAuth } from "~/hooks/useAuth";
import WebSocketService from '~/services/webSocketService'; // Importar WebSocketService

// This is the main layout for most pages
export default function Layout() {
  const [showLoginDialog, setShowLoginDialog] = useState<boolean>(false);
  const [showAuthRequired, setShowAuthRequired] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const { verifyUser, user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const guestStatus = sessionStorage.getItem('isGuest') === 'true';
      if (guestStatus !== isGuest) {
        setIsGuest(guestStatus);
      }
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    const localUserCode = localStorage.getItem('userCode');
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    // If there is an auth token, we are logged in, just connect websocket
    if (authToken && user) {
      const webSocketService = WebSocketService.getInstance();
      webSocketService.connect();

      // If we are logged in, we are not a guest
      if (isGuest) {
        setIsGuest(false);
        sessionStorage.removeItem('isGuest');
      }
      return;
    }

    // If there is a legacy userCode, we MUST force migration
    if (localUserCode) {
      setShowLoginDialog(true);
      return;
    }

    // If no user and not on index, and not already showing a dialog, show auth required
    if (!user && location.pathname !== "/" && !showLoginDialog && !showAuthRequired) {
      setShowAuthRequired(true);
      return;
    }

    // If no user and no legacy code and not a guest, show login selection (only on index)
    if (!user && !isGuest && location.pathname === "/") {
      setShowLoginDialog(true);
    }
  }, [user, showLoginDialog, showAuthRequired, loading, isGuest, location.pathname])

  if (loading) {
    return <main className="flex-1 w-full overflow-y-auto flex justify-center items-center p-0 text-[2rem] font-bold">Loading...</main>; // Or a better spinner
  }

  const handleCloseLogin = (forceClose: boolean = false) => {
    setShowLoginDialog(false);
    // If the user closed without logging in, we assume they are a guest if they are on the index
    if (!user && location.pathname === "/") {
      setIsGuest(true);
      sessionStorage.setItem('isGuest', 'true');
    }
  };

  const handleOpenLogin = () => {
    setShowAuthRequired(false);
    setIsGuest(false); // Reset guest state if they want to log in
    sessionStorage.removeItem('isGuest');
    setShowLoginDialog(true);
  };

  const handleCancelAuthRequired = () => {
    setShowAuthRequired(false);
    navigate("/"); // Redirect to index
    // Only show login dialog if they are not already a guest
    if (!isGuest) {
      setShowLoginDialog(true);
    }
  };

  return (
    <>
      {/* <Header /> */}
      <LoginDialog isOpen={showLoginDialog} closeDialog={() => handleCloseLogin(false)} onLoginSuccess={() => handleCloseLogin(true)} />
      <AuthRequiredDialog
        isOpen={showAuthRequired}
        onLogin={handleOpenLogin}
        onCancel={handleCancelAuthRequired}
      />
      <main className="flex-1 w-full overflow-y-auto flex justify-center p-0">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
