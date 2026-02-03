import type { Route } from "./+types";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Statistics - Sushi Counter" },
    { name: "description", content: "Now you know how many sushi do you eat" },
  ];
}

export default function Statistics() {
  return (
    <div className="w-full max-w-[400px] p-4 flex flex-col items-center">
      <h1 className="text-center m-0 text-6xl font-bold my-8">Statistics</h1>
      <p className="text-[#aaa]">Work in progress</p>
    </div>
  );
}
