import DialogComponent from "./DialogComponent";

export default function ChangeMonth({ open, changeMonth, setIsDialogOpen }: { open: boolean, changeMonth: (month: string) => void, setIsDialogOpen: (open: boolean) => void }) {

    const handleChangeMonth = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const month = formData.get("month") as string;
        if (month) {
            changeMonth(month);
        }
        setIsDialogOpen(false);
    }

    return (
        <DialogComponent isOpen={open} onClose={() => setIsDialogOpen(false)} className="p-6">
            <form onSubmit={handleChangeMonth} className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-center mb-2">Cambiar Mes</h2>
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">Selecciona el mes:</label>
                    <input
                        type="month"
                        name="month"
                        required
                        className="p-4 rounded-[10px] border border-[#333] bg-[#252525] text-white w-full box-border"
                    />
                </div>
                <div className="flex flex-col gap-2 mt-4">
                    <button type="submit" className="bg-[#444] hover:bg-[#555] text-white font-bold py-3 rounded-xl transition-colors">
                        Cambiar Mes
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsDialogOpen(false)}
                        className="text-gray-400 hover:text-white transition-colors py-2"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </DialogComponent>
    );
}
