import keyIcon from "../../assets/icons/auth/key.svg";

interface LegacyCodeFormProps {
    setMode: (mode: 'login' | 'register') => void;
}

export default function LegacyCodeForm({
    setMode
}: LegacyCodeFormProps) {
    return (
        <>
            <h2 className="mb-0 text-[1.75rem] font-extrabold text-center w-full">
                Legacy Access
            </h2>

            <span className="relative w-full group">
                <img src={keyIcon} alt="Key icon" className="invert w-5 absolute left-4 top-1/2 -translate-y-1/2"/>
                <input name="code" className="p-4 pl-10.75 [text-indent:1px] rounded-[10px] border border-[#333] bg-[#252525] text-white w-full box-border" type="text" placeholder="Enter your code" required />
            </span>

            <button className="w-full p-[0.85rem] rounded-[10px] bg-[#444] text-white font-bold text-[1rem] cursor-pointer transition-all hover:bg-[#555]" type="submit">
                Enter
            </button>

            <span className="flex items-center gap-2 text-[0.9rem] text-[#bbb]">
                <span>Don't have a code?</span>
                <button type="button" className="text-[#555] font-bold cursor-pointer hover:text-white transition-colors bg-transparent border-none p-0" onClick={() => setMode('register')}>Sign up</button>
            </span>

            <button type="button" className="text-[#888] text-[0.8rem] cursor-pointer hover:text-white transition-colors bg-transparent border-none p-0 mt-2" onClick={() => setMode('login')}>
                Back to Login
            </button>
        </>
    );
}
