import DialogComponent from "../DialogComponent";
import lockIcon from "../../assets/icons/auth/lock.svg";

interface AuthRequiredDialogProps {
    isOpen: boolean;
    onLogin: () => void;
    onCancel: () => void;
}

export default function AuthRequiredDialog({ isOpen, onLogin, onCancel }: AuthRequiredDialogProps) {
    return (
        <DialogComponent isOpen={isOpen} onClose={onCancel}>
            <div className="p-6 text-center flex flex-col items-center gap-6">
                <div className="w-16 h-16 bg-[#252525] border border-[#333] rounded-full flex items-center justify-center">
                    <img src={lockIcon} alt="Lock" className="h-8 w-8 invert opacity-80" />
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-[1.75rem] font-extrabold text-white leading-tight">
                        Login Required
                    </h2>
                    <p className="text-[#bbb] text-[0.95rem]">
                        Para acceder a esta funcionalidad, necesitas tener una cuenta.
                    </p>
                    <p className="text-[0.8rem] text-[#888]">
                        Inicia sesión para guardar tu historial, ver estadísticas detalladas y participar en torneos.
                    </p>
                </div>

                <div className="flex flex-col w-full gap-3 mt-2">
                    <button
                        onClick={onLogin}
                        className="w-full p-[0.85rem] rounded-[10px] bg-[#444] text-white font-bold text-[1rem] cursor-pointer transition-all hover:bg-[#555]"
                    >
                        Iniciar Sesión / Registrarse
                    </button>
                    <button
                        onClick={onCancel}
                        className="text-[#888] text-[0.85rem] cursor-pointer hover:text-white transition-colors bg-transparent border-none p-0 mt-1"
                    >
                        No, volver al inicio
                    </button>
                </div>
            </div>
        </DialogComponent>
    );
}
