import { Link } from "react-router";
import calendarImg from "../assets/icons/ui/calendar.svg";
import tournamentsImg from "../assets/icons/ui/trophy.svg";
import homeImg from "../assets/icons/ui/sushi.svg";
import statisticsImg from "../assets/icons/ui/chart.svg";
import userImg from "../assets/icons/ui/user.svg";

export default function Footer() {
    return (
        <footer className="sticky bottom-0 left-0 w-full border-t border-[#333] bg-[#222222]">
            <nav className="flex flex-row pt-5 pb-3 gap-[0.8em] justify-center m-0 text-[1.2rem] text-[#aaa] text-center">
                <Link to="/calendar" aria-label="View Calendar">
                    <img src={calendarImg} alt="Calendar" className="text-white w-[1.5em] h-auto" />
                </Link>
                <Link to="/tournaments" aria-label="View Tournaments">
                    <img src={tournamentsImg} alt="Tournaments" className="text-white w-[1.5em] h-auto" />
                </Link>
                <Link to="/" aria-label="Home Counter">
                    <img src={homeImg} alt="Home" className="text-white w-[1.5em] h-auto" />
                </Link>
                <Link to="/statistics" aria-label="View Statistics">
                    <img src={statisticsImg} alt="Statistics" className="text-white w-[1.5em] h-auto" />
                </Link>
                <Link to="/user" aria-label="View Profile">
                    <img src={userImg} alt="User" className="text-white w-[1.5em] h-auto" />
                </Link>
            </nav>
        </footer>
    );
}
