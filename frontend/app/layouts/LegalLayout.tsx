import { Outlet } from "react-router";
import LegalHeader from "~/components/legal/LegalHeader";
import CookieBanner from "~/components/legal/CookieBanner";

export default function LegalLayout() {
  return (
    <div className="flex flex-col w-full min-h-dvh bg-[#222222]">
      <LegalHeader />
      <main className="flex-1 w-full flex justify-center">
        <Outlet />
      </main>
      <CookieBanner />
    </div>
  );
}
