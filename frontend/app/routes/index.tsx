import type { Route } from "./+types/index";
import upArrow from '../assets/icons/ui/chevron-up.svg'
import downArrow from '../assets/icons/ui/chevron-down.svg'
import niamNiam from '../assets/niam-niam.png'
import useCounter from "~/hooks/useCounter";
import { useAuth } from "~/hooks/useAuth";
import { useLanguage } from "~/context/LanguageContext";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Sushi Counter - Track Your Sushi Consumption" },
    { name: "description", content: "Sushi Counter is a free sushi tracker: count pieces without an account, or sign in to save meals, view your calendar and statistics, and compete with friends." },
    { name: "keywords", content: "sushi counter, sushi tracker, food tracker, sushi log, sushi tournament" },
    { property: "og:title", content: "Sushi Counter | Cada pieza cuenta" },
    { property: "og:description", content: "Cuenta tu sushi y compite con tus amigos." },
  ];
}

export default function Index() {

  const { count, modifyCounter } = useCounter();
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto flex min-h-0 flex-col items-center justify-center gap-[clamp(1.5rem,5dvh,3rem)] px-4 py-5">
      <header className="w-full max-w-[440px] shrink-0 text-center">
        <h1 className="m-0 whitespace-pre-line text-[clamp(2.5rem,11vw,3.25rem)] font-bold leading-[1.02]">{t('Sushi Counter')}</h1>
        {!user && <p className="mt-3 text-balance text-[13px] leading-relaxed text-gray-300 sm:text-base">
          {t('Track your sushi and compete with friends.')}
        </p>}
      </header>
      <img
        src={niamNiam} alt="A man eating sushi, very happy"
        className="w-[70%] max-w-[275px] max-h-[42dvh] h-auto object-contain cursor-pointer"
        onClick={() => modifyCounter(1)}
      />
      <section className="flex shrink-0 flex-col items-center gap-3">
        <p className="text-2xl font-bold" aria-live="polite" aria-label={`${t('Current sushi count')}: ${count}`}>{count}</p>
        <div className="flex flex-row justify-center gap-14">
          <button type="button" onClick={() => modifyCounter(1)} className="w-12 h-12 p-0 border-none bg-transparent cursor-pointer flex items-center justify-center" aria-label={t('Add one sushi')}>
            <img src={upArrow} alt="Add one sushi" className="w-10 h-auto" />
          </button>
          <button type="button" onClick={() => modifyCounter(count == 0 ? 0 : -1)} className="w-12 h-12 p-0 border-none bg-transparent cursor-pointer flex items-center justify-center" aria-label={t('Remove one sushi')}>
            <img src={downArrow} alt="Remove one sushi" className="w-10 h-auto" />
          </button>
        </div>
      </section>

    </main>

  )
}
