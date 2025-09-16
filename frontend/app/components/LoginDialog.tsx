import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import "~/styles/dialog.css"

export default function LoginDialog({ isOpen, closeDialog }: { isOpen: boolean, closeDialog: () => void }) {
    const [hasUserCode, setHasUserCode] = useState<Boolean | null>(null);
    const { verifyUser, createUser } = useAuth();

    const handleSetUserCode = (userCode: string) => {
        const response = verifyUser(userCode);
        response.then((res) => {
            if (res.success) {
                closeDialog();
            } else {
                alert("Error verifying user: " + res.errorMessage);
            }
        }).catch((error) => {
            alert("Error verifying user: " + error);
        });
    }

    const handleCreateUser = (name: string) => {
        const response = createUser(name);
        //si devuelve success = true cierra el dialogo y si devuelve success = false muestra el error
        response.then((res) => {
            if (res.success == true) {
                closeDialog();
            } else {
                alert("Error creating user: " + res.errorMessage);
            }
        }).catch((error) => {
            alert("Error creating user: " + error);
        });

        //call api to create user and get userCode
        const userCode = '1234'; //dummy userCode
        // setUserCode(userCode);
    }

    return (
        <dialog open={isOpen} className="login-dialog">
            {
                hasUserCode == null ?
                    <form onSubmit={(ev) => { ev.preventDefault()}}>
                        <h2>Do you have a user</h2>
                        <button onClick={() => {setTimeout(() => setHasUserCode(true), 100)}}>Yes</button>
                        <button onClick={() => {setTimeout(() => setHasUserCode(false), 100)}}>No</button>
                    </form>
                    : hasUserCode ?
                        <form onSubmit={(ev) => { ev.preventDefault(); const form = ev.target as HTMLFormElement; handleSetUserCode(form.getElementsByTagName('input')[0].value); }}>
                            <h2>Enter your user userCode</h2>
                            <input type="text" />
                            <button>Submit</button>
                            <button onClick={() => setHasUserCode(null)}>Back</button>
                        </form>
                        :
                        <form onSubmit={(ev) => { ev.preventDefault(); const form = ev.target as HTMLFormElement; handleCreateUser(form.getElementsByTagName('input')[0].value); }}>
                            <h2>Your name</h2>
                            <input type="text" />
                            <button>Create user</button>
                            <button onClick={() => setHasUserCode(null)}>Back</button>
                        </form>
            }
        </dialog>
    );
}
