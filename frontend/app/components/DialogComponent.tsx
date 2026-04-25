import { useEffect, useRef, type ReactNode } from "react";

interface DialogComponentProps {
    children: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    className?: string;
    dialogRef?: React.RefObject<HTMLDialogElement | null>;
    closeOnClickOutside?: boolean;
}

export default function DialogComponent({
    children,
    isOpen,
    onClose,
    className = "",
    dialogRef: externalRef,
    closeOnClickOutside = true
}: DialogComponentProps) {
    const internalRef = useRef<HTMLDialogElement>(null);
    const dialogRef = (externalRef || internalRef) as React.RefObject<HTMLDialogElement | null>;

    useEffect(() => {
        if (dialogRef.current === null) return;
        if (isOpen) {
            if (!dialogRef.current.open) {
                dialogRef.current.showModal();
            }
        } else {
            if (dialogRef.current.open) {
                dialogRef.current.close();
            }
        }
    }, [isOpen, dialogRef]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnClickOutside && e.target === e.currentTarget) {
            e.stopPropagation();
            onClose();
        }
    };

    const handleClose = (e: React.SyntheticEvent) => {
        e.stopPropagation();
        onClose();
    };

    return (
        <dialog
            className={`fixed inset-0 bg-[#2a2a2a] text-white rounded-3xl justify-self-center self-center backdrop:bg-black/60 backdrop:backdrop-blur-sm max-w-[90dvw] max-h-[90dvh] overflow-hidden z-50 border border-white/10 shadow-2xl ${isOpen ? 'flex flex-col' : 'hidden'} ${className}`}
            onClick={handleBackdropClick}
            ref={dialogRef as React.RefObject<HTMLDialogElement>}
            onClose={handleClose}
            onCancel={(e) => e.stopPropagation()}
        >
            {children}
        </dialog>
    )
}
