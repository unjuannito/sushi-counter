import { useState } from "react";
import { useCalendar } from "~/hooks/useCalendar";
import DialogComponent from "~/components/DialogComponent";
import { useLanguage } from "~/context/LanguageContext";

export default function AddLogDialog({ open, setShowAddLogDialog, day, upsertLog }: { open: boolean, setShowAddLogDialog: (open: boolean) => void, day: string, upsertLog: (sushiCount: number, createdAt: Date, updatedAt: Date) => Promise<void> }) {
    const { t } = useLanguage();

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
                <h2 className="text-2xl font-bold text-center mb-2">{t('Add Sushi')}</h2>
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">{t('Number of pieces:')}</label>
                    <input
                        type="number"
                        name="sushiCount"
                        required
                        min={1}
                        className="field-control"
                        placeholder={t('e.g. 8')}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">{t('Time:')}</label>
                    <input
                        type="time"
                        name="when"
                        required
                        className="field-control"
                    />
                </div>
                <div className="flex flex-col gap-2 mt-4">
                    <button type="submit" className="primary-button">
                        {t('Save Log')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowAddLogDialog(false)}
                        className="text-gray-400 hover:text-white transition-colors py-2"
                    >
                        {t('Cancel')}
                    </button>
                </div>
            </form>
        </DialogComponent>
    );
}
