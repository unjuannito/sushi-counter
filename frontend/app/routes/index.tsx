import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/index";
import upArrow from '../assets/icons/ui/chevron-up.svg'
import downArrow from '../assets/icons/ui/chevron-down.svg'
import niamNiam from '../assets/niam-niam.png'
import useCounter from "~/hooks/useCounter";
import { useAuth } from "~/hooks/useAuth";

const HOME_INFO_DISMISSED_KEY = "homeInfoDismissed";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Sushi Counter - Track Your Sushi Consumption" },
    { name: "description", content: "Track how many sushi pieces you eat every day. Log your meals, view your calendar history, check statistics, and compete with friends in sushi eating tournaments." },
    { name: "keywords", content: "sushi counter, sushi tracker, food tracker, sushi log, sushi tournament" },
    { property: "og:title", content: "Sushi Counter - Track Your Sushi Consumption" },
    { property: "og:description", content: "Track how many sushi pieces you eat every day. Log your meals, view statistics, and compete with friends!" },
  ];
}

export default function Index() {

  const { count, modifyCounter } = useCounter();
  const { user } = useAuth();
  const [infoDismissed, setInfoDismissed] = useState(false);

  useEffect(() => {
    setInfoDismissed(sessionStorage.getItem(HOME_INFO_DISMISSED_KEY) === "true");
  }, []);

  const dismissInfo = () => {
    sessionStorage.setItem(HOME_INFO_DISMISSED_KEY, "true");
    setInfoDismissed(true);
  };

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto flex flex-col gap-8 p-4 pb-8 items-center">
      <section className="w-full max-w-[400px] flex flex-col gap-4 items-center">
        <h1 className="text-center m-0 text-6xl font-bold my-8">Sushi Counter</h1>
        <img
          src={niamNiam} alt="A man eating sushi, very happy"
          className='w-[65%] h-auto cursor-pointer self-center'
          onClick={() => modifyCounter(1)}
        />
        <p className="text-2xl font-bold self-center align-self-center" aria-live="polite" aria-label={`Current sushi count: ${count}`}>{count}</p>
        <div className="flex flex-row justify-center gap-16">
          <button type="button" onClick={() => modifyCounter(1)} className="w-12 h-12 p-0 border-none bg-transparent cursor-pointer flex items-center justify-center" aria-label="Add one sushi">
            <img src={upArrow} alt="Add one sushi" className="w-10 h-auto" />
          </button>
          <button type="button" onClick={() => modifyCounter(count == 0 ? 0 : -1)} className="w-12 h-12 p-0 border-none bg-transparent cursor-pointer flex items-center justify-center" aria-label="Remove one sushi">
            <img src={downArrow} alt="Remove one sushi" className="w-10 h-auto" />
          </button>
        </div>
      </section>

      {!user && !infoDismissed && <section className="relative w-full rounded-xl border border-gray-700 bg-[#292929] p-5 text-gray-300 select-text">
        <button
          type="button"
          onClick={dismissInfo}
          aria-label="Close introduction"
          className="absolute right-3 top-3 rounded px-2 py-1 text-xl leading-none text-gray-400 hover:bg-[#383838] hover:text-white focus-visible:outline-2 focus-visible:outline-[#646cff]"
        >
          ×
        </button>
        <h2 className="pr-8 text-xl font-semibold text-white">Track your sushi, one piece at a time</h2>
        <p className="mt-3">
          Sushi Counter lets you count the sushi pieces you eat. You can use the counter above without an account.
          Sign in to save your meals, see them on a calendar, review your statistics, and join sushi-eating tournaments with friends.
        </p>
        <p className="mt-3">
          Google sign-in is available to create or access your account. You can also use email and password.
        </p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          <Link to="/login">Sign in</Link>
          <Link to="/register">Create an account</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/legal-notice">Legal Notice</Link>
          <Link to="/cookies-policy">Cookies Policy</Link>
        </div>
      </section>}
    </main>

  )
}
