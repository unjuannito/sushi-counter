import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import Footer from "~/components/Footer";
import LoginDialog from "~/components/LoginDialog";
import { useAuth } from "~/hooks/useAuth";
import WebSocketService from '~/services/webSocketService'; // Importar WebSocketService

// This is the main layout for most pages
export default function Layout() {
  const [showLoginDialog, setShowLoginDialog] = useState<boolean>(false);
  const { verifyUser, user } = useAuth();

  useEffect(() => {
    const localUserCode = localStorage.getItem('userCode');
    if (localUserCode) {
      const response = verifyUser(localUserCode);
      response.then((res) => {
        if (res.success) {
          const webSocketService = WebSocketService.getInstance();
          webSocketService.connect();
          return;
        }
        setShowLoginDialog(true);
      }).catch((error) => {
        setShowLoginDialog(true);
      });
    }
    if (localUserCode) return
    setShowLoginDialog(true);
  }, [showLoginDialog])

  return (
    <>
      {/* <Header /> */}
      <LoginDialog isOpen={showLoginDialog} closeDialog={() => setShowLoginDialog(false)} />
      <Outlet />
      <Footer />
    </>
  );
}
