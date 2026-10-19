import type { Route } from "./+types/index";
import niamNiam from "../assets/niam-niam.png";
import sushiIcon from "../assets/icons/ui/sushi.svg";
import useCounter from "~/hooks/useCounter";
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

  return (
    <main className="flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-hidden px-4 py-2">
      <div className="-translate-y-3 flex min-h-0 w-full max-w-xl flex-col items-center justify-center gap-3 text-center">
        <p className="eyebrow m-0 w-full max-w-[320px] shrink-0 -translate-y-2 text-center text-[1.1rem] font-black tracking-[.18em]" style={{ WebkitTextStroke: '0.2px currentColor' }}>{t('Eat. Count. Compete.')}</p>

        <button
          type="button"
          onClick={() => modifyCounter(1)}
          aria-label={t('Add one sushi')}
          className="group grid h-[clamp(100px,calc(100dvh-440px),260px)] w-[clamp(100px,calc(100dvh-440px),260px)] shrink-0 place-items-center rounded-full bg-transparent p-0 transition-transform hover:scale-[1.03] active:scale-95 sm:h-[clamp(180px,30dvh,260px)] sm:w-[clamp(180px,30dvh,260px)]"
        >
          <img
            src={niamNiam}
            alt=""
            aria-hidden="true"
            className="h-full w-full select-none object-contain drop-shadow-[0_16px_22px_#0005] transition-transform duration-200 group-hover:-rotate-3"
          />
        </button>

        <section className="mt-2 flex w-fit max-w-full shrink-0 items-center justify-center gap-3" aria-label={t('Your count')}>
          <p className="m-0 text-7xl font-black leading-[.9] tracking-[-.08em] text-[#f6f0e7] sm:text-8xl" aria-live="polite" aria-label={`${t('Current sushi count')}: ${count}`}>{count}</p>
          <img src={sushiIcon} alt="" aria-hidden="true" className="h-24 w-24 object-contain sm:h-32 sm:w-32" />
        </section>

        <div className="mt-4 flex w-full max-w-[280px] shrink-0 items-center justify-center gap-3 sm:max-w-[360px]">
          <button type="button" onClick={() => modifyCounter(count === 0 ? 0 : -1)} disabled={count === 0} className="secondary-button h-11 min-h-11 flex-1 text-2xl disabled:opacity-35" aria-label={t('Remove one sushi')}>−</button>
          <button type="button" onClick={() => modifyCounter(1)} className="primary-button h-11 min-h-11 flex-1 text-2xl" aria-label={t('Add one sushi')}>+</button>
        </div>
      </div>
    </main>
  );
}
