import { use, useEffect, useState } from "react";
import type { Route } from "./+types/index";
import upArrow from '../assets/up.svg'
import downArrow from '../assets/down.svg'
import niamNiam from '../assets/niam-niam.png'
import { useUserTournaments } from "~/hooks/useUserTournaments";
import LoginDialog from "../components/LoginDialog";
import "../styles/index.css"
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
    <main>
      <h1>Sushi Counter</h1>
      <img
        src={niamNiam} alt="A man eating sushi, very happy"
        className='niam-niam'
        onClick={() => modifyCounter(1)}
      />
      <h2>{count}</h2>
      <div className="arrows">
        <img src={upArrow} onClick={() => modifyCounter(1)} />
        <img src={downArrow} onClick={() => modifyCounter(count == 0 ? 0 : -1)} />
      </div>
    </main>
  )
}
