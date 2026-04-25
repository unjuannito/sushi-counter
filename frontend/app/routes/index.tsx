import { use, useEffect, useState } from "react";
import type { Route } from "./+types/index";
import upArrow from '../assets/icons/ui/chevron-up.svg'
import downArrow from '../assets/icons/ui/chevron-down.svg'
import niamNiam from '../assets/niam-niam.png'
import { useUserTournaments } from "~/hooks/useUserTournaments";
import useCounter from "~/hooks/useCounter";

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

  return (
    <main className="flex-1 w-full max-w-[400px] mx-auto flex flex-col gap-4 p-4 justify-center items-center">
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
    </main>

  )
}
