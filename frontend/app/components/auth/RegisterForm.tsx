import { Link } from "react-router";
import atIcon from "../../assets/icons/auth/at.svg";
import lockIcon from "../../assets/icons/auth/lock.svg";
import userPlusIcon from "../../assets/icons/auth/user-plus.svg";
import googleIcon from "../../assets/icons/social/google.svg";

interface RegisterFormProps {
    onGoogleLoginClick: () => void;
    error?: string | null;
}

export default function RegisterForm({
    onGoogleLoginClick,
    error
}: RegisterFormProps) {
    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-4xl font-black tracking-tight text-white m-0">
                    Create Account
                </h1>
                <p className="text-[#888] text-sm font-medium max-w-[300px]">
                    Join the sushi eating competition and track your progress.
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
                        <img src={userPlusIcon} alt="User icon" className="invert w-5 absolute left-0 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                        <input
                            name="name"
                            className="w-full bg-transparent border-b border-white/10 p-4 pl-8 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors"
                            type="text"
                            placeholder="Full Name"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <img src={atIcon} alt="At icon" className="invert w-5 absolute left-0 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                        <input
                            name="email"
                            className="w-full bg-transparent border-b border-white/10 p-4 pl-8 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors"
                            type="email"
                            placeholder="Email address"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <img src={lockIcon} alt="Lock icon" className="invert w-5 absolute left-0 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                        <input
                            name="password"
                            className="w-full bg-transparent border-b border-white/10 p-4 pl-8 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors"
                            type="password"
                            placeholder="Password"
                            required
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        className="w-full py-4 rounded-full bg-white text-black font-bold text-base hover:bg-[#ddd] active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        type="submit"
                    >
                        Get Started
                    </button>

                    <div className="flex items-center gap-4 py-2">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">OR</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <button
                        type="button"
                        className="flex items-center justify-center gap-3 w-full py-4 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all cursor-pointer"
                        onClick={onGoogleLoginClick}
                    >
                        <img src={googleIcon} width="18" height="18" alt="Google" className="brightness-110" />
                        Sign up with Google
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-4 items-center">
                <p className="text-sm text-[#888]">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-white font-bold hover:underline transition-all"
                    >
                        Sign in
                    </Link>
                </p>
                <Link
                    to="/"
                    className="text-[#666] text-xs font-bold hover:text-white transition-colors uppercase tracking-widest"
                >
                    Continue as Guest
                </Link>
            </div>
        </div>
    );
}
