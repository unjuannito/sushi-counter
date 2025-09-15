import type { Route } from "./+types";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "User - Sushi Counter" },
    { name: "description", content: "Your profile sushi eater" },
  ];
}


export default function User() {
    return (
        <main>
            <h1>User</h1>
            <p>Work in progress</p>
        </main>
    );
}
