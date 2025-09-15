import type { Route } from "./+types";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Calendar - Sushi Counter" },
    { name: "description", content: "Your sushi eating history" },
  ];
}

export default function Calendar() {
    return (
        <main>
            <h1>Calendar</h1>
            <p>Work in progress</p>
        </main>
    );
}
