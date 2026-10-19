import { Link } from "react-router";
import atIcon from "../../assets/icons/auth/at.svg";
import lockIcon from "../../assets/icons/auth/lock.svg";
import googleIcon from "../../assets/icons/social/google.svg";
import { useLanguage } from "~/context/LanguageContext";

interface LoginFormProps {
    onGoogleLoginClick: () => void;
    handleGuest: () => void;
    error?: string | null;
}

export default function LoginForm({
    onGoogleLoginClick,
    handleGuest,
    error
}: LoginFormProps) {
    const { t } = useLanguage();
    return (
        <div className="surface-card flex w-full flex-col gap-7 p-7 sm:p-9">
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="m-0 text-4xl font-black tracking-tight text-[#f6f0e7]">
                    {t('Welcome Back')}
                </h1>
                <p className="text-[#888] text-sm font-medium max-w-[280px]">
                    {t('Count your sushi plates and compete with friends.')}
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-center text-sm font-medium animate-in fade-in zoom-in duration-300">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <div className="relative group">
                        <img src={atIcon} alt="At icon" className="invert w-5 absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                        <input
                            name="email"
                            className="field-control pl-11 placeholder:text-[#777168]"
                            type="email"
                            placeholder={t('Email address')}
                            required
                        />
                    </div>

                    <div className="relative group">
                        <img src={lockIcon} alt="Lock icon" className="invert w-5 absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                        <input
                            name="password"
                            className="field-control pl-11 placeholder:text-[#777168]"
                            type="password"
                            placeholder={t('Password')}
                            required
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        className="primary-button w-full text-base"
                        type="submit"
                    >
                        {t('Sign In')}
                    </button>

                    <div className="flex items-center gap-4 py-2">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{t('OR')}</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <button
                        type="button"
                        className="secondary-button w-full text-sm"
                        onClick={onGoogleLoginClick}
                    >
                        <img src={googleIcon} width="18" height="18" alt="Google" className="brightness-110" />
                        {t('Continue with Google')}
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-4 items-center mt-4">
                <p className="text-sm text-[#888]">
                    {t("Don't have an account?")}{" "}
                    <Link
                        to="/register"
                        className="font-bold text-[#fb715a] hover:underline"
                    >
                        {t('Create one')}
                    </Link>
                </p>
                <button
                    type="button"
                    className="text-[#666] text-xs font-bold hover:text-white transition-colors uppercase tracking-widest cursor-pointer bg-transparent border-none p-0"
                    onClick={handleGuest}
                >
                    {t('Continue as Guest')}
                </button>
            </div>
        </div>
    );
}
