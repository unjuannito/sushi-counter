
export default function ChangeMonth( { open, changeMonth, setIsDialogOpen} : {open: boolean, changeMonth: (month: string) => void, setIsDialogOpen: (open: boolean) => void} ) {

    const handleChangeMonth = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const month = formData.get("month") as string;
        if (month) {
            changeMonth(month);
        }
        setIsDialogOpen(false);
    }

    return <dialog open={open}>
        <form onSubmit={handleChangeMonth}>
            <label>
                Select Month:
                <input type="month" name="month" required/>
            </label>
            <button type="submit">Change Month</button>
            <button type="button" onClick={() => setIsDialogOpen(false)}>Cancel</button>
        </form>
    </dialog>
}
