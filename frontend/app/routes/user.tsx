import { useAuth } from "~/hooks/useAuth";
import type { Route } from "./+types";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "User - Sushi Counter" },
    { name: "description", content: "Your profile sushi eater" },
  ];
}

const handleCopy = async (userCode: string) => {
  try {
    // Copia el enlace al portapapeles
    await navigator.clipboard.writeText(userCode);
    alert('Link copied to clipboard!');
  } catch (error) {
    console.error('Error during copy to clipboard:', error);
    alert('Error during copy to clipboard: ' + error);
  }
}



export default function User() {
  const { user } = useAuth();
  return (
    <main>
      <h1>User</h1>
      <section>
        Your secret code: {user?.code}
        <button onClick={(ev) => { ev.stopPropagation(); if (user) handleCopy(user.code) }}>Copy link</button>
      </section>
    </main>
  );
}
