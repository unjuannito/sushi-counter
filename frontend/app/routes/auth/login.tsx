import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "~/hooks/useAuth";
import LoginForm from "~/components/auth/LoginForm";
import sushiIcon from "~/assets/niam-niam.png"; // Reusing the sushi image for branding

export default function Login() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, googleLogin, user, loading } = useAuth();
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
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const res = await login(email, password);
        if (res.success) {
            navigate(redirectTo);
        } else {
            setError(res.errorMessage || "Login failed");
        }
    };

    const handleGuest = () => {
        navigate("/");
    };

    return (
        <main className="flex-1 w-full max-w-[400px] mx-auto flex flex-col gap-4 p-4 justify-center">
            <form onSubmit={handleSubmit}>
                <LoginForm
                    onGoogleLoginClick={() => googleLoginAction()}
                    handleGuest={handleGuest}
                    error={error}
                />
            </form>
        </main>
    );
}
