import DialogComponent from "~/components/DialogComponent";
import { useLanguage } from "~/context/LanguageContext";

export default function ChangeMonth({ open, maxMonth, changeMonth, setIsDialogOpen }: { open: boolean, maxMonth: string, changeMonth: (month: string) => void, setIsDialogOpen: (open: boolean) => void }) {
    const { t } = useLanguage();

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
                <h2 className="text-2xl font-bold text-center mb-2">{t('Change Month')}</h2>
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">{t('Select month:')}</label>
                    <input
                        type="month"
                        name="month"
                        required
                        max={maxMonth}
                        className="field-control"
                    />
                </div>
                <div className="flex flex-col gap-2 mt-4">
                    <button type="submit" className="primary-button">
                        {t('Change Month')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsDialogOpen(false)}
                        className="text-gray-400 hover:text-white transition-colors py-2"
                    >
                        {t('Cancel')}
                    </button>
                </div>
            </form>
        </DialogComponent>
    );
}
