import { use, useEffect, useState } from "react";
import type { Route } from "./+types/index";
import upArrow from '../assets/icons/ui/chevron-up.svg'
import downArrow from '../assets/icons/ui/chevron-down.svg'
import niamNiam from '../assets/niam-niam.png'
import { useUserTournaments } from "~/hooks/useUserTournaments";
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
    <main className="flex-1 w-full max-w-[400px] mx-auto flex flex-col gap-4 p-4 justify-center items-center">
      <h1 className="text-center m-0 text-6xl font-bold my-8">Sushi Counter</h1>
      <img
        src={niamNiam} alt="A man eating sushi, very happy"
        className='w-[65%] h-auto cursor-pointer self-center'
        onClick={() => modifyCounter(1)}
      />
      <h2 className="text-2xl font-bold self-center align-self-center">{count}</h2>
      <div className="flex flex-row justify-center gap-16">
        <img src={upArrow} onClick={() => modifyCounter(1)} className="w-8 h-auto cursor-pointer" />
        <img src={downArrow} onClick={() => modifyCounter(count == 0 ? 0 : -1)} className="w-8 h-auto cursor-pointer" />
      </div>
    </main>

  )
}
