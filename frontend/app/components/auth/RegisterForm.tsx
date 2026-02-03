import { useGoogleLogin } from "@react-oauth/google";
import atIcon from "../../assets/icons/auth/at.svg";
import lockIcon from "../../assets/icons/auth/lock.svg";
import userPlusIcon from "../../assets/icons/auth/user-plus.svg";
import googleIcon from "../../assets/icons/social/google.svg";

interface RegisterFormProps {
    handleGoogleSuccess: (tokenResponse: any) => void;
    handleGoogleError: () => void;
    setMode: (mode: 'login') => void;
}

export default function RegisterForm({
    handleGoogleSuccess,
    handleGoogleError,
    setMode
}: RegisterFormProps) {
    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            console.log("useGoogleLogin onSuccess (Register):", tokenResponse);
            handleGoogleSuccess(tokenResponse);
        },
        onError: (error) => {
            console.error("useGoogleLogin onError (Register):", error);
            handleGoogleError();
        },
        flow: 'implicit',
    });

    return (
        <>
            <h2 className="mb-0 text-[1.75rem] font-extrabold text-center w-full">
                Register
            </h2>

            <span className="relative w-full group">
                <img src={userPlusIcon} alt="User icon" className="invert w-5 absolute left-4 top-1/2 -translate-y-1/2"/>
                <input name="name" className="p-4 pl-10.75 [text-indent:1px] rounded-[10px] border border-[#333] bg-[#252525] text-white w-full box-border" type="text" placeholder="Name" required />
            </span>

            <span className="relative w-full group">
                <img src={atIcon} alt="At icon" className="invert w-5 absolute left-4 top-1/2 -translate-y-1/2"/>
                <input name="email" className="p-4 pl-10.75 [text-indent:1px] rounded-[10px] border border-[#333] bg-[#252525] text-white w-full box-border" type="email" placeholder="Email" required />
            </span>

            <span className="relative w-full group">
                <img src={lockIcon} alt="Lock icon" className="invert w-5 absolute left-4 top-1/2 -translate-y-1/2"/>
                <input name="password" className="p-4 pl-10.75 [text-indent:1px] rounded-[10px] border border-[#333] bg-[#252525] text-white w-full box-border" type="password" placeholder="Password" required />
            </span>

            <p className="text-[0.75rem] text-[#888] mt-[-0.5rem] self-start">Min 8 chars, 1 uppercase, 1 number</p>

            <button className="w-full p-[0.85rem] rounded-[10px] bg-[#444] text-white font-bold text-[1rem] cursor-pointer transition-all hover:bg-[#555]" type="submit">
                Register
            </button>

            <span className="w-full flex items-center gap-4 my-2 opacity-50 before:h-px before:flex-1 before:bg-white/20 after:h-px after:flex-1 after:bg-white/20 text-[0.7rem] font-bold">OR</span>

            <button type="button" className="flex items-center justify-center gap-3 w-full h-[44px] bg-white border border-[#ddd] rounded-[10px] text-[#222] text-[0.9rem] font-bold cursor-pointer transition-all duration-200 hover:bg-[#f5f5f5] shadow-sm" onClick={() => login()}>
                <img src={googleIcon} width="20" height="20" alt="Google" />
                Sign up with Google
            </button>

            <button type="button" className="text-[#888] text-[0.8rem] cursor-pointer hover:text-white transition-colors bg-transparent border-none p-0 mt-2" onClick={() => setMode('login')}>
                Back to Login
            </button>
        </>
    );
}
