import { Link } from "react-router";
import calendarImg from "../assets/icons/ui/calendar.svg";
import tournamentsImg from "../assets/icons/ui/trophy.svg";
import homeImg from "../assets/icons/ui/sushi.svg";
import statisticsImg from "../assets/icons/ui/chart.svg";
import userImg from "../assets/icons/ui/user.svg";

export default function Footer() {
    return (
        <footer className="sticky bottom-0 left-0 w-full border-t border-[#333] bg-[#222222]">
            <nav className="flex flex-row items-center justify-around w-full mx-auto pt-4 pb-3 px-4 text-[1.6rem] text-[#aaa] max-w-sm">
                <Link to="/calendar" aria-label="View Calendar" className="hover:opacity-80 transition-opacity">
                    <img src={calendarImg} alt="Calendar" className="text-white w-[1.5em] h-auto" />
                </Link>
                <Link to="/tournaments" aria-label="View Tournaments" className="hover:opacity-80 transition-opacity">
                    <img src={tournamentsImg} alt="Tournaments" className="text-white w-[1.5em] h-auto" />
                </Link>
                <Link to="/" aria-label="Home Counter" className="hover:opacity-80 transition-opacity">
                    <img src={homeImg} alt="Home" className="text-white w-[1.5em] h-auto" />
                </Link>
                <Link to="/statistics" aria-label="View Statistics" className="hover:opacity-80 transition-opacity">
                    <img src={statisticsImg} alt="Statistics" className="text-white w-[1.5em] h-auto" />
                </Link>
                <Link to="/user" aria-label="View Profile" className="hover:opacity-80 transition-opacity">
                    <img src={userImg} alt="User" className="text-white w-[1.5em] h-auto" />
                </Link>
            </nav>
        </footer>
    );
}
