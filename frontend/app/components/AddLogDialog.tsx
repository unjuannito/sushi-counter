import { useState } from "react";
import { useCalendar } from "~/hooks/useCalendar";

export default function AddLogDialog({ open, setShowAddLogDialog, day, upsertLog }: { open: boolean, setShowAddLogDialog: (open: boolean) => void, day: string, upsertLog: (sushiCount: number, createdAt: Date, updatedAt: Date) => Promise<void> }) {

    const handleSaveLog = (event: React.FormEvent) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const sushiCount = formData.get("sushiCount");
        const when = formData.get("when") as string;
        const [dayPart, monthPart, yearPart] = day.split("-");
        const dateTime = new Date(Number(yearPart), Number(monthPart)-1, Number(dayPart), Number(when.split(":")[0]), Number(when.split(":")[1]));
        const aux = dateTime.toISOString();
        if (typeof sushiCount === "string" && typeof when === "string") {
            upsertLog(parseInt(sushiCount), dateTime, dateTime);
        }
        setShowAddLogDialog(false);
    }

    return (
        <dialog open={open}>
            <form onSubmit={handleSaveLog}>
                <h2>Add Log</h2>
                <label>
                    Sushi Count:
                    <input type="number" name="sushiCount" required min={1} />
                </label>
                <label>
                    When:
                    <input type="time" name="when" required />
                </label>
                <button type="submit">Save</button>
                <button type="button" onClick={() => setShowAddLogDialog(false)}>Cancel</button>
            </form>
        </dialog>
    );
}