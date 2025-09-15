import type { Route } from "./+types";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Statistics - Sushi Counter" },
    { name: "description", content: "Now you know how many sushi do you eat" },
  ];
}

export default function Statistics() {
    return (
        <main>
            <h1>Statistics</h1>
            <p>Work in progress</p>
        </main>
    );
}
