import { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";
import DialogComponent from "./DialogComponent";
import LoginForm from "./auth/LoginForm";
import RegisterForm from "./auth/RegisterForm";
import LegacyCodeForm from "./auth/LegacyCodeForm";
import MigrateAccountForm from "./auth/MigrateAccountForm";

type AuthMode = 'login' | 'register' | 'code' | 'migrate';

export default function LoginDialog({ isOpen, closeDialog, onLoginSuccess }: { isOpen: boolean, closeDialog: () => void, onLoginSuccess?: () => void }) {
    const [mode, setMode] = useState<AuthMode>('login');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("");

    const { login, register, googleLogin, verifyUser, forgotPassword, resetPassword, migrateAccount } = useAuth();

    const handleGoogleSuccess = async (response: any) => {
        resetState();
        const credential = response.credential || response.access_token;
        if (credential) {
            const res = await googleLogin(credential, mode === 'migrate' ? userId || undefined : undefined);
            if (res.success) {
                if (onLoginSuccess) onLoginSuccess();
                else closeDialog();
            } else {
                setError(res.errorMessage || "Google login failed");
            }
        } else {
            console.error("No credential or access_token found in response", response);
            setError("Google auth failed: No token received");
        }
    };

    const googleLoginAction = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            console.log("useGoogleLogin onSuccess (LoginDialog):", tokenResponse);
            handleGoogleSuccess(tokenResponse);
        },
        onError: (error) => {
            console.error("useGoogleLogin onError (LoginDialog):", error);
            setError("Google Login Failed. Please try again.");
        },
        flow: 'implicit',
    });

    const handleGuest = () => {
        sessionStorage.setItem('isGuest', 'true');
        if (onLoginSuccess) onLoginSuccess();
        else closeDialog();
    };

    const resetState = () => {
        setError(null);
        setMessage(null);
    };

    const handleLogin = async (formData: FormData) => {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        resetState();
        const res = await login(email, password);
        if (res.success) {
            if (onLoginSuccess) onLoginSuccess();
            else closeDialog();
        } else {
            setError(res.errorMessage || "Login failed");
        }
    };

    const handleRegister = async (formData: FormData) => {
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        resetState();
        const res = await register(name, email, password);
        if (res.success) {
            if (onLoginSuccess) onLoginSuccess();
            else closeDialog();
        } else {
            setError(res.errorMessage || "Registration failed");
        }
    };

    useEffect(() => {
        if (isOpen) {
            const localUserCode = localStorage.getItem('userCode');
            if (localUserCode && mode === 'login') {
                handleLegacyCodeWithCode(localUserCode);
            }
        }
    }, [isOpen]);

    const handleLegacyCodeWithCode = async (code: string) => {
        resetState();
        const res = await verifyUser(code);
        if (res.success && res.user) {
            if (!res.user.email) {
                setUserId(res.user.id);
                setUserName(res.user.name);
                setMode('migrate');
                setMessage("Welcome! To continue, please update your account with an email and password.");
            } else {
                localStorage.removeItem('userCode');
                setMode('login');
            }
        } else {
            localStorage.removeItem('userCode');
            setError(res.errorMessage || "Invalid code");
            setMode('code');
        }
    };

    const handleLegacyCode = async (formData: FormData) => {
        const code = formData.get('code') as string;
        handleLegacyCodeWithCode(code);
    };

    const handleMigration = async (formData: FormData) => {
        const method = formData.get('migrateMethod');
        
        // Skip email/password validation for Google OAuth
        if (method === 'google-oauth') {
            googleLoginAction();
            return;
        }

        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        resetState();
        if (!userId) return;

        const res = await migrateAccount({ userId, email, password, name });
        if (res.success) {
            if (onLoginSuccess) onLoginSuccess();
            else closeDialog();
        } else {
            setError(res.errorMessage || "Error migrating account");
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        // Append submit button value to formData manually because new FormData(form) excludes it
        const nativeEvent = e.nativeEvent as any;
        if (nativeEvent.submitter && nativeEvent.submitter.name) {
            formData.set(nativeEvent.submitter.name, nativeEvent.submitter.value);
        }

        if (mode === 'login') handleLogin(formData);
        else if (mode === 'register') handleRegister(formData);
        else if (mode === 'code') handleLegacyCode(formData);
        else if (mode === 'migrate') handleMigration(formData);
    };

    return (
        <DialogComponent isOpen={isOpen} onClose={closeDialog} closeOnClickOutside={false}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 items-center">
                {error && <div className="text-[#e63946] mb-4 text-sm bg-[#e63946]/10 p-2 rounded w-full text-center">{error}</div>}
                {message && <div className="text-[#4caf50] mb-4 text-sm bg-[#4caf50]/10 p-2 rounded w-full text-center">{message}</div>}

                {mode === 'login' && (
                    <LoginForm
                        onGoogleLoginClick={() => googleLoginAction()}
                        handleGuest={handleGuest}
                        setMode={setMode}
                    />
                )}

                {mode === 'register' && (
                    <RegisterForm
                        onGoogleLoginClick={() => googleLoginAction()}
                        setMode={setMode}
                    />
                )}

                {mode === 'code' && (
                    <LegacyCodeForm
                        setMode={setMode}
                    />
                )}

                {mode === 'migrate' && (
                    <MigrateAccountForm
                        handleBackToLogin={() => {
                            localStorage.removeItem('userCode');
                            setMode('login');
                        }}
                        defaultName={userName}
                    />
                )}
            </form>
        </DialogComponent>
    );
}
