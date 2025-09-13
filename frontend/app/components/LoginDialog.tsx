import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function LoginDialog({ isOpen, closeDialog }: { isOpen: boolean, closeDialog: () => void }) {
    const [hasUserCode, setHasUserCode] = useState<Boolean | null>(null);
    const { verifyUser, createUser } = useAuth();

    const handleSetUserCode = (code: string) => {
        const response = verifyUser(code);
        //si devuelve success = true cierra el dialogo y si devuelve success = false muestra el error
        response.then((res) => {
            if (res.success) {
                localStorage.setItem('userCode', code);
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
                console.log('User created:', res.user);
                localStorage.setItem('userCode', res.user?.userCode || '');
                closeDialog();
            } else {
                alert("Error creating user: " + res.errorMessage);
            }
        }).catch((error) => {
            alert("Error creating user: " + error);
        });

        //call api to create user and get code
        const code = '1234'; //dummy code
        // setUserCode(code);
    }

    return (
        <dialog open={isOpen} className="login-dialog">
            {
                hasUserCode == null ?
                    <main>
                        <h2>Do you have a user</h2>
                        <button onClick={() => setHasUserCode(true)}>Yes</button>
                        <button onClick={() => setHasUserCode(false)}>No</button>
                    </main>
                    : hasUserCode ?
                        <main>
                            <form onSubmit={(ev) => { ev.preventDefault(); const form = ev.target as HTMLFormElement; handleSetUserCode(form.getElementsByTagName('input')[0].value); }}>
                                <h2>Enter your user code</h2>
                                <input type="text" />
                                <button >Submit</button>
                            </form>
                        </main>
                        :
                        <main>
                            <form onSubmit={(ev) => { ev.preventDefault(); const form = ev.target as HTMLFormElement; handleCreateUser(form.getElementsByTagName('input')[0].value); }}>
                                <h2>Your name</h2>
                                <input type="text" />
                                <button>Create user</button>
                            </form>
                        </main>
            }
        </dialog>
    );
}
