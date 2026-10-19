import { useLocation, useNavigate } from "react-router";
import DialogComponent from "../DialogComponent";
import lockIcon from "../../assets/icons/auth/lock.svg";
import { useLanguage } from "~/context/LanguageContext";

interface AuthRequiredDialogProps {
    isOpen: boolean;
    onCancel: () => void;
}

export default function AuthRequiredDialog({ isOpen, onCancel }: AuthRequiredDialogProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const handleLoginRedirect = () => {
        const redirectTo = encodeURIComponent(location.pathname + location.search);
        navigate(`/login?redirectTo=${redirectTo}`);
    };

    return (
        <DialogComponent isOpen={isOpen} onClose={onCancel}>
            <div className="p-6 text-center flex flex-col items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#fb715a50] bg-[#fb715a20]">
                    <img src={lockIcon} alt="Lock" className="h-8 w-8 invert opacity-80" />
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-[1.75rem] font-extrabold text-white leading-tight">
                        {t('Login Required')}
                    </h2>
                    <p className="text-[#bbb] text-[0.95rem]">
                        {t('To access this feature, you need an account.')}
                    </p>
                    <p className="text-[0.8rem] text-[#888]">
                        {t('Log in to save your history, view detailed statistics, and participate in tournaments.')}
                    </p>
                </div>

                <div className="flex flex-col w-full gap-3 mt-2">
                    <button
                        onClick={handleLoginRedirect}
                        className="primary-button w-full"
                    >
                        {t('Login / Register')}
                    </button>
                    <button
                        onClick={onCancel}
                        className="text-[#888] text-[0.85rem] cursor-pointer hover:text-white transition-colors bg-transparent border-none p-0 mt-1"
                    >
                        {t('No, go back')}
                    </button>
                </div>
            </div>
        </DialogComponent>
    );
}
