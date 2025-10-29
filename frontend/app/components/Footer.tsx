import calendarImg from "../assets/calendar-days.svg";
import tournamentsImg from "../assets/trophy.svg";
import homeImg from "../assets/sushi.svg";
import statisticsImg from "../assets/chart-simple.svg";
import userImg from "../assets/user.svg";
import "../styles/footer.css";
export default function Footer() {
    return (
        <footer>
            <nav>
                <a href="/calendar">
                    <img src={calendarImg} alt="Calendar" />
                </a>
                <a href="/tournaments">
                    <img src={tournamentsImg} alt="Tournaments" />
                </a>
                <a href="/">
                    <img src={homeImg} alt="Home" />
                </a>
                <a href="/statistics">
                    <img src={statisticsImg} alt="Statistics" />
                </a>
                <a href="/user">
                    <img src={userImg} alt="User" />
                </a>
            </nav>
        </footer>
    );
}