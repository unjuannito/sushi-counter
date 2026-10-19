import { NavLink, useLocation } from "react-router";
import { useLanguage } from "~/context/LanguageContext";
import calendarImg from "../assets/icons/ui/calendar.svg";
import tournamentsImg from "../assets/icons/ui/trophy.svg";
import homeImg from "../assets/icons/ui/sushi.svg";
import statisticsImg from "../assets/icons/ui/chart.svg";
import userImg from "../assets/icons/ui/user.svg";

export default function Footer() {
  const { t } = useLanguage();
  const location = useLocation();
  const items = [
    { to: "/calendar", label: t("View Calendar"), short: t("Calendar"), icon: calendarImg },
    { to: "/tournaments", label: t("View Tournaments"), short: t("Tournaments"), icon: tournamentsImg },
    { to: "/", label: t("Home Counter"), short: t("Home"), icon: homeImg },
    { to: "/statistics", label: t("View Statistics"), short: t("Statistics"), icon: statisticsImg },
    { to: "/user", label: t("View Profile"), short: t("Profile"), icon: userImg },
  ];

  return (
    <footer className="relative z-10 w-full shrink-0 border-t border-[#48423a] bg-[#211f1bcf] backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-[720px] items-center justify-around gap-1 px-3 py-2 pb-[max(.5rem,env(safe-area-inset-bottom))]" aria-label="Main navigation">
        {items.map(({ to, label, short, icon }) => (
          <NavLink key={to} to={to} end={to === "/"} aria-label={label} className={({ isActive }) => `group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 transition-colors ${isActive || (to === '/tournaments' && location.pathname.startsWith('/tournament/')) ? "bg-[#fb715a1c] text-[#fb715a]" : "text-[#a9a49a] hover:bg-white/5 hover:text-[#f6f0e7]"}`}>
            <img src={icon} alt="" className="h-5 w-5 opacity-75 group-hover:opacity-100" />
            <span className="truncate text-[10px] font-bold tracking-wide sm:text-xs">{short}</span>
          </NavLink>
        ))}
      </nav>
    </footer>
  );
}
