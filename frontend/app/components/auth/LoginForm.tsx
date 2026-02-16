import atIcon from "../../assets/icons/auth/at.svg";
import lockIcon from "../../assets/icons/auth/lock.svg";
import googleIcon from "../../assets/icons/social/google.svg";
import keyIcon from "../../assets/icons/auth/key.svg";

interface LoginFormProps {
    onGoogleLoginClick: () => void;
    handleGuest: () => void;
    setMode: (mode: 'register' | 'code') => void;
}

export default function LoginForm({
    onGoogleLoginClick,
    handleGuest,
    setMode
}: LoginFormProps) {
    return (
        <>
            <h2 className="mb-0 text-[1.75rem] font-extrabold text-center w-full">
                Login
            </h2>

            <span className="relative w-full group text-white">
                <img src={atIcon} alt="At icon" className="invert w-5 absolute left-4 top-1/2 -translate-y-1/2"/>
                <input name="email" className="p-4 pl-10.75 [text-indent:1px] rounded-[10px] border border-[#333] bg-[#252525] text-white w-full box-border" type="email" placeholder="Email" required />
            </span>

            <span className="relative w-full group">
                <img src={lockIcon} alt="Lock icon" className="invert w-5 absolute left-4 top-1/2 -translate-y-1/2"/>
                <input name="password" className="p-4 pl-10.75 [text-indent:1px] rounded-[10px] border border-[#333] bg-[#252525] text-white w-full box-border" type="password" placeholder="Password" required />
            </span>

            <button className="w-full p-[0.85rem] rounded-[10px] bg-[#444] text-white font-bold text-[1rem] cursor-pointer transition-all hover:bg-[#555]" type="submit">
                Login
            </button>

            <span className="flex items-center gap-2 text-[0.9rem] text-[#bbb]">
                <span>Don't have an account?</span>
                <button type="button" className="text-[#555] font-bold cursor-pointer hover:text-white transition-colors bg-transparent border-none p-0" onClick={() => setMode('register')}>Sign up</button>
            </span>

            <span className="w-full flex items-center gap-4 my-2 opacity-50 before:h-px before:flex-1 before:bg-white/20 after:h-px after:flex-1 after:bg-white/20 text-[0.7rem] font-bold">OR</span>


            <button type="button" className="flex items-center justify-center gap-3 w-full h-[44px] bg-white border border-[#ddd] rounded-[10px] text-[#222] text-[0.9rem] font-bold cursor-pointer transition-all duration-200 hover:bg-[#f5f5f5] shadow-sm" onClick={onGoogleLoginClick}>
                <img src={googleIcon} width="20" height="20" alt="Google" />
                Sign in with Google
            </button>
            <button type="button" className="flex items-center justify-center gap-3 w-full h-[44px] bg-[#252525] border border-[#333] rounded-[10px] text-[#ddd] text-[0.9rem] font-bold cursor-pointer hover:bg-[#2a2a2a]" onClick={() => setMode('code')}>
                <img src={keyIcon} width="20" height="20" alt="Key" className="invert" />
                Use Legacy Code
            </button>
            <button type="button" className="text-[#888] text-[0.8rem] cursor-pointer hover:text-white transition-colors bg-transparent border-none p-0 mt-2" onClick={handleGuest}>
                Continue as Guest
            </button>
        </>
    );
}
