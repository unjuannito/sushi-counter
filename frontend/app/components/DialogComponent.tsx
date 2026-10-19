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
            className={`fixed inset-0 bg-[#2d2b26] text-[#f6f0e7] rounded-3xl justify-self-center self-center backdrop:bg-black/70 backdrop:backdrop-blur-sm max-w-[90dvw] max-h-[90dvh] overflow-hidden z-50 border border-[#62594d] shadow-2xl ${isOpen ? 'flex flex-col' : 'hidden'} ${className}`}
            onClick={handleBackdropClick}
            ref={dialogRef as React.RefObject<HTMLDialogElement>}
            onClose={handleClose}
            onCancel={(e) => e.stopPropagation()}
        >
            {children}
        </dialog>
    )
}
