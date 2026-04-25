import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "~/hooks/useAuth";
import RegisterForm from "~/components/auth/RegisterForm";
import sushiIcon from "~/assets/niam-niam.png";
import type { Route } from "./+types/register";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Create Account - Sushi Counter" },
        { name: "description", content: "Join Sushi Counter today to start tracking your sushi consumption and competing with friends." },
        { name: "robots", content: "noindex, nofollow" },
    ];
}

export default function Register() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { register, googleLogin, user, loading } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const redirectTo = searchParams.get("redirectTo") || "/";

    // If already logged in, redirect away
    useEffect(() => {
        if (!loading && user) {
            navigate(redirectTo);
        }
    }, [user, loading, navigate, redirectTo]);

    const handleGoogleSuccess = async (tokenResponse: any) => {
        const credential = tokenResponse.access_token;
        if (credential) {
            const res = await googleLogin(credential);
            if (res.success) {
                navigate(redirectTo);
            } else {
                setError(res.errorMessage || "Google login failed");
            }
        }
    };

    const googleLoginAction = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => setError("Google Login Failed"),
        flow: 'implicit',
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const res = await register(name, email, password);
        if (res.success) {
            navigate(redirectTo);
        } else {
            setError(res.errorMessage || "Registration failed");
        }
    };

    return (
        <main className="flex-1 w-full max-w-[400px] mx-auto flex flex-col gap-4 p-4 justify-center">
            <form onSubmit={handleSubmit}>
                <RegisterForm
                    onGoogleLoginClick={() => googleLoginAction()}
                    error={error}
                />
            </form>
        </main>
    );
}
