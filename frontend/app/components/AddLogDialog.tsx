import { useState } from "react";
import { useCalendar } from "~/hooks/useCalendar";
import DialogComponent from "./DialogComponent";

export default function AddLogDialog({ open, setShowAddLogDialog, day, upsertLog }: { open: boolean, setShowAddLogDialog: (open: boolean) => void, day: string, upsertLog: (sushiCount: number, createdAt: Date, updatedAt: Date) => Promise<void> }) {

    const handleSaveLog = (event: React.FormEvent) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const sushiCount = formData.get("sushiCount");
        const when = formData.get("when") as string;
        const [dayPart, monthPart, yearPart] = day.split("-");
        const dateTime = new Date(Number(yearPart), Number(monthPart) - 1, Number(dayPart), Number(when.split(":")[0]), Number(when.split(":")[1]));
        if (typeof sushiCount === "string" && typeof when === "string") {
            upsertLog(parseInt(sushiCount), dateTime, dateTime);
        }
        setShowAddLogDialog(false);
    }

    return (
        <DialogComponent isOpen={open} onClose={() => setShowAddLogDialog(false)} className="p-6">
            <form onSubmit={handleSaveLog} className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-center mb-2">Añadir Sushi</h2>
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">Cantidad de piezas:</label>
                    <input
                        type="number"
                        name="sushiCount"
                        required
                        min={1}
                        className="bg-[#3a3a3a] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: 8"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">Hora:</label>
                    <input
                        type="time"
                        name="when"
                        required
                        className="bg-[#3a3a3a] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex flex-col gap-2 mt-4">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
                        Guardar Registro
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowAddLogDialog(false)}
                        className="text-gray-400 hover:text-white transition-colors py-2"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </DialogComponent>
    );
}