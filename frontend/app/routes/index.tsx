import { use, useEffect, useState } from "react";
import type { Route } from "./+types/index";
import upArrow from '../assets/icons/ui/chevron-up.svg'
import downArrow from '../assets/icons/ui/chevron-down.svg'
import niamNiam from '../assets/niam-niam.png'
import { useUserTournaments } from "~/hooks/useUserTournaments";
import LoginDialog from "../components/LoginDialog";
import useCounter from "~/hooks/useCounter";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Sushi Counter" },
    { name: "description", content: "Count how many sushi dou you eat!" },
  ];
}

export default function Index() {

  const { count, modifyCounter } = useCounter();

  return (
    // <main className="flex flex-col items-center justify-center gap-8 p-[4rem_2rem_2rem_2rem] box-border w-full flex-1 max-w-[600px]">
    <div className="w-full max-w-[400px] p-4 flex flex-col items-center gap-8 justify-center">
      <h1 className="text-center m-0 text-6xl font-bold my-8">Sushi Counter</h1>
      <img
        src={niamNiam} alt="A man eating sushi, very happy"
        className='w-[65%] h-auto cursor-pointer'
        onClick={() => modifyCounter(1)}
      />
      <h2 className="text-2xl font-bold">{count}</h2>
      <div className="flex flex-row justify-center gap-16">
        <img src={upArrow} onClick={() => modifyCounter(1)} className="w-8 h-auto cursor-pointer" />
        <img src={downArrow} onClick={() => modifyCounter(count == 0 ? 0 : -1)} className="w-8 h-auto cursor-pointer" />
      </div>
    </div>
  )
}
