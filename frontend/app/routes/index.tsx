import { use, useEffect, useState } from "react";
import type { Route } from "./+types/index";
import upArrow from '../assets/up.svg'
import downArrow from '../assets/down.svg'
import niamNiam from '../assets/niam-niam.png'
// import animatedNiamNiam from '../assets/niam-niam.gif'
import LoginDialog from "../components/LoginDialog";
import "../styles/index.css"
export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Index() {
  const [count, setCount] = useState<number>(0)
  // const [isMoving, setIsMoving] = useState<boolean>(false);

  useEffect(() => {
    const oldCounter: number = parseInt(localStorage.getItem('sushiCounter') || '0');
    if (oldCounter) {
      setCount(oldCounter)
    }

  }, [])

  const modifyCounter = (mod: number) => {
    const newCounter: number = count + mod;
    setCount(newCounter);
    localStorage.setItem('sushiCounter', newCounter.toString());
    // if (mod != 1) return;
    // setIsMoving(true)
    // setTimeout(() => {
    //   setIsMoving(false)
    // }, 2e3)
  }

  return (
    <main>
      <h1>Sushi Counter</h1>
      <img
        // src={isMoving ? animatedNiamNiam : niamNiam} alt="A man eating sushi, very happy"
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
